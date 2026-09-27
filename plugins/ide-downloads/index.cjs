const { loadCatalog } = require('./catalog.cjs');

module.exports = function ideDownloadsPlugin(context, options) {
    return {
        name: 'handstack-ide-downloads',
        async loadContent() {
            const catalog = await loadCatalog(options);
            if (catalog.status === 'unavailable') {
                console.warn('[IDE downloads] 배포 정보를 읽지 못했습니다. /ide에서 공식 배포 페이지로 안내합니다.');
            }
            return catalog;
        },
        contentLoaded({ content, actions }) {
            actions.setGlobalData(content);
        },
    };
};
