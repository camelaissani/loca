LOCA.routes.owner = {
    url: function () {
        return '/page/owner';
    },
    title: window.i18next.t('Landloard'),
    change: function (callback) {
        if (!LOCA.ownerCtrl.alreadyLoaded) {
            LOCA.ownerCtrl.alreadyLoaded = true;
            LOCA.ownerCtrl.startUp();
        }
        LOCA.ownerCtrl.loadData(callback);
    }
};
