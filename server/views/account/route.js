LOCA.routes.account = {
    url: function () {
        return '/page/account';
    },
    title: 'Compte',
    change: function (callback) {
        LOCA.accountCtrl.loadData(callback);
    }
};