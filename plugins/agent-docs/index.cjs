'use strict';

// 빌드 결과에 AI 에이전트용 산출물(llms.txt, llms-full.txt, 검색 인덱스)을 추가합니다.
const fs = require('fs');
const path = require('path');
const { createSlugger } = require('@docusaurus/utils');
const { convertMdx, splitIntoChunks } = require('./convert.cjs');
const { getTarget, getUnavailableReason, startDevMcp } = require('./dev-mcp.cjs');

const DOCS_PLUGIN_NAME = 'docusaurus-plugin-content-docs';
const SAMPLE_EXTENSIONS = new Set(['.html', '.js', '.json', '.xml', '.md', '.css']);
const SAMPLE_MAX_BYTES = 200 * 1024;

// llms.txt 의 "Optional" 절로 내리는 보조 자료 경로입니다.
const OPTIONAL_PREFIXES = ['reference/presentation/', 'reference/vide-coding-instruction/'];

const SECTION_LABELS = [
    ['startup', '시작하기'],
    ['tutorial', '따라 만들기'],
    ['guides', '작업별 가이드'],
    ['reference', 'API·설정 참조'],
    ['ide', 'IDE 사용하기'],
    ['twelvefactor', '배포·운영 원칙 (12-Factors)'],
];

function toPosix(value) {
    return value.split(path.sep).join('/');
}

function stripDocsPrefix(source) {
    return source.replace(/^@site\/docs\//, '');
}

function sectionOf(relativePath) {
    const top = relativePath.split('/')[0];
    return SECTION_LABELS.some(([key]) => key === top) ? top : 'etc';
}

function moduleOf(relativePath) {
    const matched = /^reference\/api\/modules\/([^/]+)\.mdx?$/.exec(relativePath);
    return matched ? matched[1] : null;
}

const DESCRIPTION_MAX_LENGTH = 160;

function oneLine(text) {
    const line = (text || '').replace(/\s+/g, ' ').trim();
    return line.length > DESCRIPTION_MAX_LENGTH ? `${line.slice(0, DESCRIPTION_MAX_LENGTH - 1)}…` : line;
}

function collectSamples(siteDir, baseUrl) {
    const root = path.join(siteDir, 'static', 'sample');
    const samples = [];
    if (!fs.existsSync(root)) {
        return samples;
    }

    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const absolute = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(absolute);
            } else if (SAMPLE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) && fs.statSync(absolute).size <= SAMPLE_MAX_BYTES) {
                const relative = toPosix(path.relative(path.join(siteDir, 'static'), absolute));
                samples.push({
                    path: relative,
                    url: `${baseUrl}/${encodeURI(relative)}`,
                    text: fs.readFileSync(absolute, 'utf8').replace(/^﻿/, ''),
                });
            }
        }
    };
    walk(root);
    return samples.sort((a, b) => a.path.localeCompare(b.path));
}

// 마크다운 링크는 공백을 포함할 수 없습니다.
function linkUrl(url) {
    return url.replace(/ /g, '%20');
}

function buildLlmsTxt({ siteConfig, entries, fullFiles, baseUrl }) {
    const lines = [`# ${siteConfig.title}`, '', `> ${siteConfig.tagline}`, ''];
    lines.push(
        'HandStack 공식 문서입니다. 화면(HTML·JavaScript), 거래 계약(transact), SQL 계약(dbclient)을 ID로 연결해 업무 웹 앱을 만듭니다.',
        '아래 목록은 문서별 한 줄 설명이며, 각 링크는 해당 문서의 웹 페이지입니다.',
        '',
    );

    const main = entries.filter((entry) => !entry.optional);
    for (const [key, label] of [...SECTION_LABELS, ['etc', '기타']]) {
        const group = main.filter((entry) => entry.section === key);
        if (group.length === 0) {
            continue;
        }
        lines.push(`## ${label}`, '');
        for (const entry of group) {
            lines.push(`- [${entry.title}](${linkUrl(entry.url)})${entry.description ? `: ${entry.description}` : ''}`);
        }
        lines.push('');
    }

    const mcpGuide = entries.find((entry) => entry.relativePath.endsWith('guides/에이전트에-문서-연결하기.md'));
    const agentsTemplate = entries.find((entry) => entry.relativePath.endsWith('examples/AGENTS.md'));
    if (mcpGuide && agentsTemplate) {
        lines.push(
            '## AI 에이전트 연동',
            '',
            `- [${mcpGuide.title}](${linkUrl(mcpGuide.url)}): 문서를 검색·조회하는 원격 MCP 서버(${baseUrl}/mcp) 등록 방법`,
            `- [${agentsTemplate.title}](${linkUrl(agentsTemplate.url)}): HandStack 프로젝트용 AGENTS.md 템플릿`,
            '',
        );
    }

    lines.push('## 전체 본문', '');
    for (const file of fullFiles) {
        lines.push(`- [${file.label}](${baseUrl}/${file.name}): ${file.count}개 문서의 마크다운 본문`);
    }
    lines.push('');

    const optional = entries.filter((entry) => entry.optional);
    if (optional.length > 0) {
        lines.push('## Optional', '');
        for (const entry of optional) {
            lines.push(`- [${entry.title}](${linkUrl(entry.url)})${entry.description ? `: ${entry.description}` : ''}`);
        }
        lines.push('');
    }

    return lines.join('\n');
}

function buildFullText(entries, heading) {
    const parts = [`<!-- ${heading} -->`, ''];
    for (const entry of entries) {
        parts.push('---', `title: ${entry.title}`, `url: ${entry.url}`, '---', '', entry.markdown.trimEnd(), '');
    }
    return parts.join('\n');
}

function writeArtifacts({ siteDir, siteConfig, version, targetDir }) {
    const baseUrl = (siteConfig.url + siteConfig.baseUrl).replace(/\/+$/, '');
    const docs = version.docs.filter((doc) => !doc.unlisted && !doc.frontMatter?.draft);

    const sourceToPermalink = new Map();
    for (const doc of docs) {
        sourceToPermalink.set(path.normalize(doc.source.replace(/^@site\//, siteDir + path.sep)), doc.permalink);
    }

    const entries = docs.map((doc) => {
        const absolutePath = path.normalize(doc.source.replace(/^@site\//, siteDir + path.sep));
        const relativePath = stripDocsPrefix(doc.source);
        const raw = fs.readFileSync(absolutePath, 'utf8');
        const markdown = convertMdx(raw, { baseUrl, docAbsolutePath: absolutePath, siteDir, sourceToPermalink });
        return {
            id: doc.id,
            source: `docs/${relativePath}`,
            relativePath,
            url: baseUrl + doc.permalink,
            title: doc.title,
            description: oneLine(doc.description),
            section: sectionOf(relativePath),
            module: moduleOf(relativePath),
            optional: OPTIONAL_PREFIXES.some((prefix) => relativePath.startsWith(prefix)),
            markdown,
        };
    }).sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'ko'));

    // 문서 인덱스: 본문은 문서마다 한 번만 담고, 청크는 본문의 위치만 가리킵니다.
    const indexDocs = [];
    const indexChunks = [];
    entries.forEach((entry, docIndex) => {
        indexDocs.push({
            id: entry.id,
            source: entry.source,
            url: entry.url,
            title: entry.title,
            description: entry.description,
            section: entry.section,
            module: entry.module,
            optional: entry.optional,
            markdown: entry.markdown,
        });
        for (const chunk of splitIntoChunks(entry.markdown, { title: entry.title, createSlugger })) {
            indexChunks.push([docIndex, chunk.heading.join(' > '), chunk.anchor, chunk.start, chunk.end]);
        }
    });

    const samples = collectSamples(siteDir, baseUrl);
    const index = {
        schema: 1,
        generatedAt: new Date().toISOString(),
        baseUrl,
        docs: indexDocs,
        chunks: indexChunks,
        samples,
    };

    fs.mkdirSync(path.join(targetDir, 'agent'), { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'agent', 'docs-index.json'), JSON.stringify(index));

    const fullFiles = [{ name: 'llms-full.txt', label: '전체 문서', count: entries.length }];
    fs.writeFileSync(path.join(targetDir, 'llms-full.txt'), buildFullText(entries, `${siteConfig.title} 전체 문서`));

    for (const [key, label] of [...SECTION_LABELS, ['etc', '기타']]) {
        const group = entries.filter((entry) => entry.section === key);
        if (group.length === 0) {
            continue;
        }
        const name = `llms-${key}.txt`;
        fs.writeFileSync(path.join(targetDir, name), buildFullText(group, `${siteConfig.title} ${label}`));
        fullFiles.push({ name, label, count: group.length });
    }

    fs.writeFileSync(path.join(targetDir, 'llms.txt'), buildLlmsTxt({ siteConfig, entries, fullFiles, baseUrl }));

    console.log(`[agent-docs] 문서 ${entries.length}개, 청크 ${indexChunks.length}개, 예제 ${samples.length}개를 변환했습니다.`);
}

// 개발 서버가 사용할 포트입니다. docusaurus start 의 --port / PORT 를 따릅니다.
function devServerPort() {
    const argv = process.argv;
    const index = argv.findIndex((arg) => arg === '--port' || arg === '-p');
    const fromArgs = index >= 0 ? argv[index + 1] : argv.find((arg) => arg.startsWith('--port='))?.slice('--port='.length);
    return Number(fromArgs ?? process.env.PORT ?? 3000) || 3000;
}

const UNREADY_TARGET = 'http://127.0.0.1:1';

function devMcpProxy(route) {
    return {
        context: [route],
        // 서버가 준비되기 전에는 아무도 듣지 않는 포트로 보내 onError 의 503 응답을 받게 합니다.
        target: UNREADY_TARGET,
        router: () => getTarget() ?? UNREADY_TARGET,
        changeOrigin: true,
        logLevel: 'silent',
        pathRewrite: route === '/mcp' ? undefined : { [`^${route}`]: '/mcp' },
        onError(error, request, response) {
            if (typeof response?.writeHead !== 'function' || response.headersSent) {
                return;
            }
            const reason = getUnavailableReason() || 'MCP 서버를 준비하는 중입니다. 잠시 후 다시 시도하세요.';
            response.writeHead(503, { 'content-type': 'application/json; charset=utf-8' });
            response.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: reason }, id: null }));
        },
    };
}

function findDocsVersion(plugins) {
    const docsPlugin = plugins.find((plugin) => plugin.name === DOCS_PLUGIN_NAME && plugin.options?.id === 'default');
    return docsPlugin?.content?.loadedVersions?.[0];
}

module.exports = function agentDocsPlugin(context, options = {}) {
    const { siteDir, siteConfig, generatedFilesDir } = context;
    // 개발 서버(npm run start)용 산출물 위치입니다. options.dev 가 false 면 만들지 않습니다.
    const devDir = path.join(generatedFilesDir, 'agent-docs-dev');
    const isDevServer = process.env.NODE_ENV === 'development' && options.dev !== false;
    // 개발 서버에서도 /mcp 로 MCP 서버를 제공합니다. options.mcp 가 false 이거나 AGENT_DOCS_MCP=false 면 켜지 않습니다.
    const isDevMcp = isDevServer && options.mcp !== false && process.env.AGENT_DOCS_MCP !== 'false';
    const mcpRoute = path.posix.join(siteConfig.baseUrl, 'mcp');

    return {
        name: 'handstack-agent-docs',

        // 문서가 바뀌면 개발 서버가 콘텐츠를 다시 읽으므로 그때마다 산출물을 갱신합니다.
        async allContentLoaded({ allContent }) {
            if (!isDevServer) {
                return;
            }

            const version = allContent[DOCS_PLUGIN_NAME]?.default?.loadedVersions?.[0];
            if (!version) {
                return;
            }

            try {
                writeArtifacts({ siteDir, siteConfig, version, targetDir: devDir });
            } catch (error) {
                console.warn(`[agent-docs] 개발 서버용 산출물 생성에 실패했습니다: ${error.message}`);
                return;
            }

            if (isDevMcp) {
                // 개발 서버 시작을 늦추지 않도록 MCP 서버가 준비될 때까지 기다리지 않습니다.
                startDevMcp({
                    mcpDir: path.join(siteDir, 'mcp'),
                    indexFile: path.join(devDir, 'agent', 'docs-index.json'),
                    publicUrl: `http://localhost:${devServerPort()}${mcpRoute}`,
                }).catch((error) => {
                    console.warn(`[agent-docs] 개발 서버용 MCP 서버를 시작하지 못했습니다: ${error.message}`);
                });
            }
        },

        // 생성한 폴더를 사이트 루트에 정적으로 노출합니다. (/llms.txt, /agent/docs-index.json)
        configureWebpack() {
            if (!isDevServer) {
                return {};
            }

            fs.mkdirSync(devDir, { recursive: true });
            return {
                devServer: {
                    // watch 를 켜면 산출물을 다시 쓸 때마다 브라우저 전체가 새로고침됩니다.
                    static: [{ directory: devDir, publicPath: siteConfig.baseUrl, watch: false }],
                    // /mcp 를 자식 프로세스로 실행한 MCP 서버에 전달합니다. 포트는 요청마다 router 가 정합니다.
                    ...(isDevMcp ? { proxy: [devMcpProxy(mcpRoute)] } : {}),
                },
            };
        },

        async postBuild({ outDir, plugins }) {
            const version = findDocsVersion(plugins);
            if (!version) {
                console.warn('[agent-docs] 문서 콘텐츠를 찾지 못해 에이전트용 산출물을 만들지 않습니다.');
                return;
            }

            writeArtifacts({ siteDir, siteConfig, version, targetDir: outDir });
        },
    };
};
