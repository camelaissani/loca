LOCA.routes.account = {
    url: function () {
        return '/page/account';
    },
    title: window.i18next.t('Account'),
    pageInitialized: function(callback) {
        LOCA.accountCtrl.pageInitialized(callback);
    },
    dataChanged: function (callback) {
        LOCA.accountCtrl.dataChanged(callback);
    }
};
