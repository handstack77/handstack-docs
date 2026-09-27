// 참조: https://github.com/facebook/docusaurus/blob/main/website/docusaurus.config.ts, https://github.com/hojunin/hjinn/blob/main/docusaurus.config.js
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: 'HandStack',
    tagline: 'HTML·JavaScript·SQL로 업무 웹 앱을 만드세요.',
    favicon: 'img/logo.ico',

    // Set the production url of your site here
    url: 'https://handstack.kr',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'handstack77', // Usually your GitHub org/user name.
    projectName: 'handstack', // Usually your repo name.

    onBrokenLinks: 'throw',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'ko',
        locales: ['ko'],
    },
    themes: ['@docusaurus/theme-mermaid'],
    plugins: [
        [require.resolve('./plugins/ide-downloads/index.cjs'), {
            serverUrl: process.env.HANDSTACK_IDE_RELEASE_SERVER_URL || 'https://stavlo.qrame.kr',
        }],
    ],
    markdown: {
        hooks: { onBrokenMarkdownLinks: 'warn' },
        format: 'detect',
        mermaid: true,
        mdx1Compat: {
            // comments: false,
        },
        preprocessor: ({ filePath, fileContent }) => {
            let result = fileContent;

            result = result.replaceAll('{/_', '{/*');
            result = result.replaceAll('_/}', '*/}');
            
            return result;
        },
    },
    scripts: [
        '/lib/master-css/master-css.min.js'
    ],
    stylesheets: [
        '/css/pure-min.css',
    ],
    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts'
                },
                blog: {
                    showReadingTime: true,
                    blogSidebarTitle: '모든 포스트',
                    blogSidebarCount: 'ALL',
                    blogTitle: 'HandStack 개발 블로그',
                    postsPerPage: 10,
                    onUntruncatedBlogPosts: 'ignore',
                },
                gtag: {
                    trackingID: 'G-G6PRQRS4K3',
                    anonymizeIP: true,
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
                sitemap: {
                    changefreq: 'weekly',
                    priority: 0.5,
                    ignorePatterns: ['/tags/**'],
                    filename: 'sitemap.xml',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        navbar: {
            hideOnScroll: true,
            title: 'HandStack',
            logo: {
                alt: 'HandStack Logo',
                src: 'img/logo.jpg',
                width: 32,
                height: 32,
            },
            items: [
                { type: 'doc', docId: 'startup/개요', position: 'left', label: '시작하기' },
                { type: 'doc', docId: 'tutorial/index', position: 'left', label: '따라 만들기' },
                { type: 'doc', docId: 'guides/index', position: 'left', label: '작업별 가이드' },
                { type: 'doc', docId: 'reference/index', position: 'left', label: 'API·설정 참조' },
                { type: 'doc', docId: 'reference/concept/index', position: 'left', label: '개념 이해' },
                { type: 'doc', docId: 'ide/index', position: 'left', label: 'IDE 사용하기' },
                {
                    type: 'dropdown', label: '더보기', position: 'right',
                    items: [
                        { to: '/docs/category/커뮤니티', label: '커뮤니티·추가 자료' },
                        { to: '/docs/category/바이브-코딩-지침', label: 'AI 활용 자료' },
                        { to: '/docs/category/강연세미나-문서', label: '발표 자료' },
                        { href: 'https://notebooklm.google.com/notebook/02e39cd7-bd8a-48ff-8ab1-12a985660a74', label: 'NotebookLM' },
                    ],
                },
                { to: '/blog', label: '블로그', position: 'right' },
                { href: 'https://github.com/handstack77/handstack', label: 'GitHub', position: 'right' },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: '문서',
                    items: [
                        {
                            label: '시작하기',
                            to: '/docs/startup/개요',
                        },
                        {
                            label: 'API·설정 참조',
                            to: '/docs/reference/',
                        },
                        {
                            label: '따라 만들기',
                            to: '/docs/tutorial/',
                        },
                        {
                            label: '블로그',
                            to: '/blog',
                        },
                    ],
                },
                {
                    title: '커뮤니티',
                    items: [
                        {
                            label: '토론',
                            href: 'https://github.com/handstack77/handstack/discussions',
                        },
                        {
                            label: '블로그',
                            to: '/blog',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/handstack77/handstack',
                        },
                        {
                            label: '라이선스',
                            to: '/docs/라이선스',
                        },
                    ],
                },
                // {
                //     title: '더보기',
                //     items: [
                //         {
                //             label: 'HandStack 컨설팅 및 PoC 지원',
                //             href: 'https://github.com/handstack77/handstack',
                //         },
                //         {
                //             label: '아이콘 제작 Flaticon',
                //             href: 'https://www.flaticon.com/kr/free-icons',
                //         },
                //     ],
                // },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} HandStack`,
        },
        liveCodeBlock: {
            playgroundPosition: 'bottom',
        },
        docs: {
            sidebar: {
                hideable: true,
                autoCollapseCategories: true,
            },
        },
        colorMode: {
            defaultMode: 'light',
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        // announcementBar: {
        //     id: 'announcementBar-3', // Increment on change
        //     content: `🎉️ <b><a target="_blank" href="https://docusaurus.io/blog/releases/3.0">Docusaurus v3.0</a> is now out!</b> 🥳️`,
        // },
        prism: {
            // https://prismjs.com/#supported-languages
            additionalLanguages: [
                'java',
                'aspnet',
                'csharp',
                'csv',
                'sql',
                'markdown',
                'mermaid',
                'wiki',
                'typescript',
                'vim',
                'yaml',
                'git',
                'bash',
                'batch',
                'docker',
                'bash',
                'json',
                'scss',
            ],
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
