LOCA.routes.owner = {
    url: function () {
        return '/page/owner';
    },
    title: window.i18next.t('Landloard'),
    pageInitialized: function(callback) {
        LOCA.ownerCtrl.pageInitialized(callback);
    },
    dataChanged: function (callback) {
        LOCA.ownerCtrl.dataChanged(callback);
    }
};
