LOCA.routes.property = {
    url: function () {
        return '/page/property';
    },
    title: 'Biens',
    change: function (callback) {
        if (!LOCA.propertyCtrl.alreadyLoaded) {
            LOCA.propertyCtrl.alreadyLoaded = true;
            LOCA.propertyCtrl.startUp();
        }
        LOCA.propertyCtrl.loadData(callback);
    },
    pageExit: function (callback) {
        LOCA.propertyCtrl.pageExit(callback);
    }
};