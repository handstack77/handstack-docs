// 참조: https://github.com/facebook/docusaurus/blob/main/website/docusaurus.config.ts, https://github.com/hojunin/hjinn/blob/main/docusaurus.config.js
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: 'HandStack',
    tagline: '앱 개발과 운영을 좀 더 쉽게 만들어 줍니다. 비즈니스에 필요한 업무 프로그램 개발 솔루션을 사용하세요',
    favicon: 'img/favicon.ico',

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
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'ko',
        locales: ['ko'],
    },
    themes: ['@docusaurus/theme-mermaid'],
    markdown: {
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
        '/lib/master@1.37.8/master-css.min.js'
    ],
    stylesheets: [
        '/css/pure-min.css',
    ],
    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                },
                blog: {
                    showReadingTime: true,
                    blogSidebarTitle: '모든 포스트',
                    blogSidebarCount: 'ALL',
                    blogTitle: 'HandStack 개발 블로그',
                    postsPerPage: 10,
                },
                gtag: {
                    trackingID: 'GTM-PXS54W8L',
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
                src: 'img/logo.svg',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'startupSidebar',
                    position: 'left',
                    label: '시작하기',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'referenceSidebar',
                    position: 'left',
                    label: '참고하기',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'informationSidebar',
                    position: 'left',
                    label: '추가정보',
                },
                {
                    to: '/blog',
                    label: '블로그',
                    position: 'left'
                },
                {
                    href: 'https://github.com/handstack77/handstack',
                    label: 'GitHub',
                    position: 'right',
                },
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
                            label: '참고하기',
                            to: '/docs/category/환경설정',
                        },
                        {
                            label: '커뮤니티',
                            to: '/docs/category/커뮤니티',
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
                            label: '디스코드',
                            href: 'https://discordapp.com/invite/handstack',
                        },
                        {
                            label: '블로그',
                            to: '/blog',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/handstack77/handstack',
                        },
                    ],
                },
                {
                    title: '더보기',
                    items: [
                        {
                            label: '큐씨엔 및 파트너',
                            href: 'https://www.qcn.co.kr/',
                        },
                        {
                            label: '프로젝트 개발 및 지원 정책',
                            href: 'https://github.com/handstack77/handstack',
                        },
                        {
                            label: '컨설팅 및 PoC 지원',
                            href: 'https://github.com/handstack77/handstack',
                        },
                        {
                            label: '개발, 운영 교육 및 기술 지원',
                            href: 'https://github.com/handstack77/handstack',
                        },
                    ],
                },
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
