LOCA.routes.occupant = {
    url: function () {
        return '/page/occupant';
    },
    title: 'Locataires',
    change: function (callback) {
        if (!LOCA.occupantCtrl.alreadyLoaded) {
            LOCA.occupantCtrl.alreadyLoaded = true;
            LOCA.occupantCtrl.startUp();
        }
        LOCA.occupantCtrl.loadData(callback);
    },
    pageExit: function (callback) {
        LOCA.occupantCtrl.pageExit(callback);
    }
};