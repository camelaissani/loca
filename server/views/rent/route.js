LOCA.routes.rent = {
    url: function () {
        return '/page/rent';
    },
    title: window.i18next.t('Rents'),
    pageInitialized: function(callback) {
        LOCA.rentCtrl.pageInitialized(callback);
    },
    dataChanged: function (callback) {
        LOCA.rentCtrl.dataChanged(callback);
    },
    pageExited: function (callback) {
        LOCA.rentCtrl.pageExited(callback);
    }
};
