'use strict';

// MDX 문서를 AI 에이전트가 읽기 좋은 순수 마크다운으로 변환하고 섹션 단위로 나눕니다.
const path = require('path');

const FENCE_PATTERN = /^\s{0,3}(`{3,}|~{3,})/;
const CHUNK_MAX_LENGTH = 2500;

function applySitePreprocessor(text) {
    // docusaurus.config.ts 의 markdown.preprocessor 와 같은 치환입니다.
    return text.replaceAll('{/_', '{/*').replaceAll('_/}', '*/}');
}

function stripFrontMatter(text) {
    const matched = /^﻿?---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/.exec(text);
    return matched ? text.slice(matched[0].length) : text.replace(/^﻿/, '');
}

// 코드 펜스 안은 그대로 두고 바깥 본문에만 변환을 적용합니다.
function splitByFence(text) {
    const segments = [];
    let buffer = [];
    let fence = null;

    const flush = (isFence) => {
        if (buffer.length > 0) {
            segments.push({ isFence, text: buffer.join('\n') });
            buffer = [];
        }
    };

    for (const line of text.split('\n')) {
        const matched = FENCE_PATTERN.exec(line);
        if (fence === null) {
            if (matched) {
                flush(false);
                fence = { char: matched[1][0], length: matched[1].length };
                buffer.push(line);
            } else {
                buffer.push(line);
            }
        } else {
            buffer.push(line);
            if (matched && matched[1][0] === fence.char && matched[1].length >= fence.length && line.trim() === matched[1]) {
                flush(true);
                fence = null;
            }
        }
    }
    flush(fence !== null);
    return segments;
}

function createLinkRewriter({ baseUrl, docAbsolutePath, siteDir, sourceToPermalink }) {
    const docDir = path.dirname(docAbsolutePath);

    function rewriteTarget(target) {
        if (/^(https?:|mailto:|tel:|#|data:)/i.test(target)) {
            return target;
        }

        const hashIndex = target.indexOf('#');
        const pathPart = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
        const hash = hashIndex >= 0 ? target.slice(hashIndex) : '';

        if (pathPart.startsWith('/')) {
            return baseUrl + pathPart + hash;
        }

        if (/\.mdx?$/i.test(pathPart)) {
            let decoded = pathPart;
            try {
                decoded = decodeURI(pathPart);
            } catch {
                // 인코딩이 깨진 링크는 원문 그대로 비교합니다.
            }
            const resolved = path.resolve(docDir, decoded);
            const permalink = sourceToPermalink.get(path.normalize(resolved));
            if (permalink) {
                return baseUrl + permalink + hash;
            }
        }

        return target;
    }

    return (prose) => {
        // 이미지는 에이전트가 읽을 수 없으므로 대체 텍스트만 남깁니다.
        let result = prose.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (all, alt, src) => {
            if (/^https?:/i.test(src) || src.startsWith('/')) {
                return `![${alt}](${rewriteTarget(src)})`;
            }
            return alt.trim() ? `[이미지: ${alt.trim()}]` : '';
        });

        result = result.replace(/(?<!!)\[([^\]]*)\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g, (all, label, target, title) => {
            return `[${label}](${rewriteTarget(target)}${title})`;
        });

        return result;
    };
}

function convertProse(prose, context) {
    let result = prose;

    result = result.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    result = result.replace(/<!--[\s\S]*?-->/g, '');
    result = result.replace(/^[ \t]*<span\s+id="[^"]*"\s*\/>[ \t]*\n?/gm, '');
    result = result.replace(/^import\s+[\s\S]*?\sfrom\s+['"][^'"]+['"];?[ \t]*$/gm, '');
    result = result.replace(/^import\s+['"][^'"]+['"];?[ \t]*$/gm, '');

    result = result.replace(/<UiLibraryPreview\s+src="([^"]+)"[^>]*\/>/g, (all, src) => {
        return `[UI 라이브러리 미리보기: ${src}](${context.baseUrl}/sample/ui-library/${encodeURI(src)}.html)`;
    });

    result = result.replace(/<\/?Tabs[^>]*>\s*\n?/g, '');
    result = result.replace(/<TabItem\b[^>]*\blabel="([^"]+)"[^>]*>\s*\n?/g, '**$1**\n\n');
    result = result.replace(/<\/TabItem>\s*\n?/g, '');

    return context.rewriteLinks(result);
}

function convertMdx(raw, context) {
    const body = stripFrontMatter(applySitePreprocessor(raw.replace(/\r\n/g, '\n')));
    const segments = splitByFence(body);
    const rewriteLinks = createLinkRewriter(context);
    const converted = segments
        .map((segment) => (segment.isFence ? segment.text : convertProse(segment.text, { ...context, rewriteLinks })))
        .join('\n');

    return converted.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function parseHeading(line) {
    const matched = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!matched) {
        return null;
    }

    let text = matched[2].trim();
    let customId = null;
    const idMatched = /\s*\{#([^}\s]+)\}\s*$/.exec(text);
    if (idMatched) {
        customId = idMatched[1];
        text = text.slice(0, idMatched.index).trim();
    }
    return { level: matched[1].length, text, customId };
}

// H2/H3 단위로 나누고, 너무 긴 섹션은 빈 줄 경계에서 다시 나눕니다.
function splitIntoChunks(markdown, { title, createSlugger }) {
    const slugger = createSlugger();
    const lines = markdown.split('\n');
    const sections = [];
    let current = { heading: [title], anchor: '', start: 0 };
    let h2 = null;
    let fence = null;
    let offset = 0;

    for (const line of lines) {
        const matchedFence = FENCE_PATTERN.exec(line);
        if (fence === null && matchedFence) {
            fence = { char: matchedFence[1][0], length: matchedFence[1].length };
        } else if (fence !== null && matchedFence && matchedFence[1][0] === fence.char && matchedFence[1].length >= fence.length && line.trim() === matchedFence[1]) {
            fence = null;
        } else if (fence === null) {
            const heading = parseHeading(line);
            if (heading) {
                const anchor = heading.customId || slugger.slug(heading.text);
                if (heading.level === 2 || heading.level === 3) {
                    sections.push({ ...current, end: offset });
                    if (heading.level === 2) {
                        h2 = heading.text;
                        current = { heading: [title, heading.text], anchor, start: offset };
                    } else {
                        current = { heading: h2 ? [title, h2, heading.text] : [title, heading.text], anchor, start: offset };
                    }
                }
            }
        }
        offset += line.length + 1;
    }
    sections.push({ ...current, end: markdown.length });

    const chunks = [];
    for (const section of sections) {
        const text = markdown.slice(section.start, section.end);
        if (text.trim().length === 0) {
            continue;
        }

        if (text.length <= CHUNK_MAX_LENGTH) {
            chunks.push(section);
            continue;
        }
        chunks.push(...splitLongSection(markdown, section));
    }
    return chunks;
}

function splitLongSection(markdown, section) {
    const pieces = [];
    let pieceStart = section.start;
    let fence = null;
    let offset = section.start;

    for (const line of markdown.slice(section.start, section.end).split('\n')) {
        const matchedFence = FENCE_PATTERN.exec(line);
        if (fence === null && matchedFence) {
            fence = { char: matchedFence[1][0], length: matchedFence[1].length };
        } else if (fence !== null && matchedFence && matchedFence[1][0] === fence.char && matchedFence[1].length >= fence.length && line.trim() === matchedFence[1]) {
            fence = null;
        }

        const lineEnd = offset + line.length + 1;
        if (fence === null && line.trim() === '' && lineEnd - pieceStart >= CHUNK_MAX_LENGTH) {
            pieces.push({ ...section, start: pieceStart, end: lineEnd });
            pieceStart = lineEnd;
        }
        offset = lineEnd;
    }

    if (pieceStart < section.end) {
        pieces.push({ ...section, start: pieceStart, end: section.end });
    }
    return pieces.filter((piece) => markdown.slice(piece.start, piece.end).trim().length > 0);
}

module.exports = { convertMdx, splitIntoChunks };
