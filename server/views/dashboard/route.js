LOCA.routes.dashboard = {
    url: function () {
        return '/page/dashboard';
    },
    title: window.i18next.t('Dashboard'),
    pageInitialized: function(callback) {
        LOCA.dashboardCtrl.pageInitialized(callback);
    },
    dataChanged: function (callback) {
        LOCA.dashboardCtrl.dataChanged(callback);
    },
    pageExited: function (callback) {
        LOCA.dashboardCtrl.pageExited(callback);
    }
};
