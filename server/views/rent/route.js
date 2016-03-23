LOCA.routes.rent = {
    url: function () {
        return '/page/rent';
    },
    title: window.i18next.t('Rents'),
    change: function (callback) {
        if (!LOCA.rentCtrl.alreadyLoaded) {
            LOCA.rentCtrl.alreadyLoaded = true;
            LOCA.rentCtrl.startUp();
        }
        LOCA.rentCtrl.loadData(callback);
    },
    pageExit: function (callback) {
        LOCA.rentCtrl.pageExit(callback);
    }
};
