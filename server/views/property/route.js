LOCA.routes.property = {
    url: function () {
        return '/page/property';
    },
    title: window.i18next.t('Properties'),
    change: function (callback) {
        if (!LOCA.propertyCtrl.alreadyLoaded) {
            LOCA.propertyCtrl.alreadyLoaded = true;
            LOCA.propertyCtrl.startUp();
        }
        LOCA.propertyCtrl.loadData(callback);
    },
    pageExit: function (callback) {
        LOCA.propertyCtrl.pageExit(callback);
    }
};
