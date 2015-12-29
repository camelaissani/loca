LOCA.routes.rent = {
    url: function () {
        return '/page/rent';
    },
    title: 'Loyers',
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