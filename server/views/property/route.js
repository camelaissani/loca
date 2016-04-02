LOCA.routes.property = {
    url: function () {
        return '/page/property';
    },
    title: window.i18next.t('Properties'),
    pageInitialized: function(callback) {
        LOCA.propertyCtrl.pageInitialized(callback);
    },
    dataChanged: function (callback) {
        LOCA.propertyCtrl.dataChanged(callback);
    },
    pageExited: function (callback) {
        LOCA.propertyCtrl.pageExited(callback);
    }
};
