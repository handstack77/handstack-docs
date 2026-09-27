// Run after npm run build. Tests published HTML, not sidebar implementation details.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'build');
const readPage = route => {
    const relative = decodeURIComponent(route).replace(/^\/+|\/+$/g, '');
    const file = path.join(build, relative, 'index.html');
    assert.ok(fs.existsSync(file), `Missing published route: ${route}`);
    const html = fs.readFileSync(file, 'utf8');
    assert.ok(!html.includes('\0'), `Unexpected null character in published HTML: ${route}`);
    return html;
};
const links = html => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(match => ({
    attrs: match[1],
    href: decodeURIComponent(match[1].match(/\bhref="([^"]*)"/)?.[1] ?? ''),
    text: match[2].replace(/<[^>]+>/g, ''),
}));

const menus = [
    ['시작하기', '/docs/startup/개요'],
    ['따라 만들기', '/docs/tutorial/'],
    ['작업별 가이드', '/docs/guides/'],
    ['API·설정 참조', '/docs/reference/'],
    ['개념 이해', '/docs/reference/concept/'],
    ['IDE 사용하기', '/docs/ide/'],
];
for (const route of ['/', '/ide', '/blog', ...menus.map(([, target]) => target)]) {
    const page = readPage(route);
    const navbar = page.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? '';
    const pageLinks = links(navbar);
    for (const [label, target] of menus) {
        assert.ok(pageLinks.some(link => link.text === label && link.href === target),
            `${route}: missing menu ${label} -> ${target}`);
    }
    const conceptIndex = pageLinks.findIndex(link => link.text === '개념 이해');
    assert.equal(pageLinks[conceptIndex + 1]?.text, 'IDE 사용하기', `${route}: IDE menu must immediately follow concepts`);
    const brand = navbar.match(/<a\b[^>]*class="[^"]*navbar__brand[^"]*"[\s\S]*?<\/a>/)?.[0] ?? '';
    assert.match(brand, /<img\b[^>]*src="\/img\/logo\.jpg"/, `${route}: missing brand logo`);
    assert.ok(brand.indexOf('<img') < brand.indexOf('navbar__title'), `${route}: logo must precede HandStack`);
    const moreIndex = pageLinks.findIndex(link => link.text === '더보기');
    const blogIndex = pageLinks.findIndex(link => link.text === '블로그');
    const githubIndex = pageLinks.findIndex(link => link.text === 'GitHub');
    assert.ok(moreIndex >= 0 && blogIndex > moreIndex && githubIndex > blogIndex,
        `${route}: expected More, Blog, GitHub order`);
    assert.equal(pageLinks.filter(link => link.text === '블로그').length, 1, `${route}: duplicate Blog menu`);
    assert.ok(pageLinks[blogIndex].attrs.includes('navbar__link'), `${route}: Blog must be a standalone menu`);
    assert.equal(pageLinks[blogIndex].href, '/blog', `${route}: incorrect Blog target`);
    assert.match(page, /<link\b[^>]*rel="icon"[^>]*href="\/img\/logo\.ico"/, `${route}: missing favicon`);
}

for (const asset of ['img/logo.jpg', 'img/logo.ico']) {
    assert.ok(fs.statSync(path.join(build, asset)).size > 0, `Missing branding asset: ${asset}`);
}

const homepage = readPage('/');
const homeLinks = links(homepage);
const runIndex = homeLinks.findIndex(link => link.text === '내 PC에서 실행하기');
assert.ok(runIndex >= 0, 'Missing homepage quick start');
assert.equal(homeLinks[runIndex + 1]?.text, 'IDE 설치하기', 'IDE button must immediately follow quick start');
assert.equal(homeLinks[runIndex + 1]?.href, '/ide', 'Incorrect IDE download page target');
const idePage = readPage('/ide');
assert.ok(idePage.includes('Stavlo'), 'IDE downloads must explain the current release package name');
assert.ok(links(idePage).some(link => link.href === '/docs/ide/'), 'IDE installer page must lead to usage docs');
const ideData = JSON.parse(fs.readFileSync(path.join(root, '.docusaurus/globalData.json'), 'utf8'))['handstack-ide-downloads'].default;
assert.ok(links(idePage).some(link => link.href === ideData.sourceUrl), 'Missing official release page fallback');
assert.ok(idePage.includes('사이트 빌드 시점'), 'IDE release metadata needs a freshness notice');
assert.ok(!idePage.includes('localhost:8090') || process.env.HANDSTACK_IDE_RELEASE_SERVER_URL?.includes('localhost:8090'), 'Do not publish local updater links by default');
for (const platform of ideData.platforms) {
    const card = idePage.match(new RegExp(`<section\\b[^>]*data-platform="${platform.channel}"[\\s\\S]*?<\\/section>`))?.[0];
    assert.ok(card, `Missing IDE platform: ${platform.name}`);
    assert.ok(card.includes(`data-status="${platform.status}"`), `Incorrect IDE availability: ${platform.name}`);
    const assets = [platform.installer, platform.portable].filter(Boolean);
    assert.deepEqual(links(card).filter(link => !link.href.startsWith('#')).map(link => link.href), assets.map(asset => decodeURIComponent(asset.url)), `Wrong IDE downloads: ${platform.name}`);
    if (platform.version && platform.status === 'ready') assert.ok(card.includes(platform.version), 'Missing IDE version');
    if (platform.status === 'pending') assert.ok(card.includes('배포 준비 중'), 'Unpublished platforms must not pretend to have downloads');
    if (platform.status === 'unavailable') assert.ok(card.includes('불러오지 못했습니다'), 'Network failures must not imply no releases exist');
}
assert.match(homepage, /<img\b[^>]*src="\/img\/handstack-ecosystem-flat-v2\.png"[^>]*alt="[^"]+"/,
    'Homepage ecosystem image must have alternative text');
assert.ok(homepage.includes('왜 HandStack인가요?'), 'Missing HandStack benefits');
assert.ok(fs.statSync(path.join(build, 'img/handstack-ecosystem-flat-v2.png')).size > 0, 'Missing ecosystem image asset');
for (const name of ['dbclient', 'command', 'prompter', 'function', 'graphclient']) {
    const route = `/docs/reference/api/modules/${name}`;
    assert.ok(links(homepage).some(link => link.href === route), `Missing homepage module link: ${name}`);
    readPage(route);
}

const learningPath = [
    '/docs/startup/개요',
    '/docs/startup/install/필수-프로그램-설치하기',
    '/docs/startup/빠른-시작',
    '/docs/tutorial/첫-조회',
    '/docs/tutorial/조회-조건-바꾸기',
    '/docs/tutorial/프로젝트와-개발서버/',
];
for (let index = 0; index < learningPath.length - 1; index++) {
    const next = links(readPage(learningPath[index])).find(link => link.attrs.includes('pagination-nav__link--next'));
    assert.equal(next?.href, learningPath[index + 1], `Wrong next step: ${learningPath[index]}`);
}

const ideLearningPath = [
    '/docs/ide/',
    '/docs/ide/learn/작업영역-열기',
    '/docs/ide/learn/프로젝트와-서버',
    '/docs/ide/learn/화면-편집하기',
    '/docs/ide/learn/계약-실행하기',
    '/docs/ide/learn/메뉴와-검증',
    '/docs/ide/learn/운영-인수인계',
];
for (let index = 0; index < ideLearningPath.length; index++) {
    const route = ideLearningPath[index];
    const pageLinks = links(readPage(route));
    const previous = pageLinks.find(link => link.attrs.includes('pagination-nav__link--prev'));
    const next = pageLinks.find(link => link.attrs.includes('pagination-nav__link--next'));
    assert.equal(previous?.href, ideLearningPath[index - 1], `Wrong IDE previous lesson: ${route}`);
    assert.equal(next?.href, ideLearningPath[index + 1], `Wrong IDE next lesson: ${route}`);
    assert.ok(pageLinks.some(link => link.href === '/docs/ide/reference/'), `${route}: missing IDE reference entry`);
}
for (const route of [
    '/docs/ide/guides/도메인-모델링', '/docs/ide/guides/tabler-studio',
    '/docs/ide/reference/', '/docs/ide/reference/메뉴와-도구',
    '/docs/ide/reference/파일과-저장-규칙', '/docs/ide/reference/단축키',
    '/docs/ide/reference/설정과-보안', '/docs/ide/reference/문제-해결',
]) {
    readPage(route);
}
const ideStorage = readPage('/docs/ide/reference/파일과-저장-규칙');
for (const anchor of ['계약-확장자', '프로젝트-경로', 'ide-host-project', '화면-원본', '메뉴-연결', '백업-대상']) {
    assert.ok(ideStorage.includes(`id="${anchor}"`), `Missing IDE reference anchor: ${anchor}`);
}
for (const term of ['.txn', '.dbc', '.bas', '.fnc', '.cyp', '.pmt', '.rpo', 'config.pageMappings', 'data-designer-props', 'data-studio-props', 'IndexedDB', '1.DesktopHost/stavlo/stavlo.csproj', 'stavlo.exe', 'Stavlo', 'Stavlo-win-Setup.exe', 'Velopack 배포 패키지 ID', 'qcn.winform/', 'winform.slnx']) {
    assert.ok(ideStorage.includes(term), `Missing IDE-specific reference: ${term}`);
}
assert.ok(links(readPage('/docs/ide/reference/')).some(link => link.href === '/docs/ide/reference/파일과-저장-규칙#ide-host-project'), 'IDE quick reference must link to the renamed host project');
assert.ok(readPage('/docs/ide/learn/계약-실행하기').includes('CREATE TABLE'), 'Warn that sample queries can modify the DB');
assert.ok(readPage('/docs/ide/reference/설정과-보안').includes('접근 토큰 검사'), 'Retain developer-mode security warning');

const oldCategories = [
    ['01-handstack-기초-개념', 'handstack-기초개념'],
    ['02-프로젝트-구조와-파일-작업', '프로젝트구조와-파일작업'],
    ['03-프로젝트와-개발-서버', '프로젝트와-개발서버'],
    ['04-도메인-모델과-데이터베이스', '도메인모델과-데이터베이스'],
    ['05-화면-저작-htmljs-작성', '화면저작'],
    ['06-화면-동작과-거래-연결', '화면동작과-거래연결'],
    ['07-dbclient-sql-계약', 'dbclient-SQL계약'],
    ['08-transact-거래-계약', 'transact-거래계약'],
    ['09-확장-모듈', '확장모듈'],
    ['10-테스트와-디버깅', '테스트와-디버깅'],
    ['11-환경설정과-보안', '환경설정과-보안'],
    ['12-모니터링과-운영-인수인계', '모니터링과-운영인수인계'],
];
for (const [slug, topic] of oldCategories) {
    const oldPage = readPage(`/docs/category/${slug}`);
    assert.ok(links(oldPage).some(link => link.href === `/docs/tutorial/${topic}/`),
        `Legacy category no longer reaches topic: ${slug}`);
    readPage(`/docs/tutorial/${topic}/`);
}

for (const slug of ['프로그램-설치', 'hands-on-lab-따라하기', '환경설정', '자습서-튜토리얼', '개념-및-관점', '커뮤니티', '바이브-코딩-지침', '강연세미나-문서']) {
    readPage(`/docs/category/${slug}`);
}
for (const [route, anchor] of [
    ['/docs/startup/빠른-시작', 'ack-실행-환경-설정'],
    ['/docs/startup/빠른-시작', 'windows-운영체제에서-실행하기'],
    ['/docs/startup/빠른-시작', 'linux-또는-macos-운영체제에서-실행하기'],
    ['/docs/startup/install/필수-프로그램-설치하기', '설치-완료-기준'],
    ['/docs/startup/learning/syn/webform', 'synwtransactionactiontransactconfiginput-options'],
    ['/docs/reference/거래-호출', '입출력-연결'],
    ['/docs/guides/문제-해결', 'board-table'],
]) {
    assert.ok(readPage(route).includes(`id="${anchor}"`), `Missing anchor: ${route}#${anchor}`);
}

for (const name of ['windows-bootstrapper.ps1', 'macos-bootstrapper.sh', 'ubuntu-bootstrapper.sh']) {
    assert.ok(fs.existsSync(path.join(build, 'install', name)), `Missing script download: ${name}`);
}
console.log('PASS: IDE downloads, six-step IDE learning and reference docs, CTA/menu order, homepage ecosystem, branding, six menus, learning pagination, 20 legacy categories, reference anchors and script downloads.');
