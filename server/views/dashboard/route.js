LOCA.routes.dashboard = {
    url: function () {
        return '/page/dashboard';
    },
    title: 'Tableau de bord',
    change: function (callback) {
        if (!LOCA.dashboardCtrl.alreadyLoaded) {
            LOCA.dashboardCtrl.alreadyLoaded = true;
            LOCA.dashboardCtrl.startUp();
        }
        LOCA.dashboardCtrl.loadData(callback);
    },
    pageExit: function (callback) {
        LOCA.dashboardCtrl.pageExit(callback);
    }
};