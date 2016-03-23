LOCA.routes.account = {
    url: function () {
        return '/page/account';
    },
    title: window.i18next.t('Account'),
    change: function (callback) {
        LOCA.accountCtrl.loadData(callback);
    }
};
