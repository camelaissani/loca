LOCA.routes.occupant = {
    url: function () {
        return '/page/occupant';
    },
    title: window.i18next.t('Tenants'),
    pageInitialized: function(callback) {
        LOCA.occupantCtrl.pageInitialized(callback);
    },
    dataChanged: function (callback) {
        LOCA.occupantCtrl.dataChanged(callback);
    },
    pageExited: function (callback) {
        LOCA.occupantCtrl.pageExited(callback);
    }
};
