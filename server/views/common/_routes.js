LOCA.routes.account = {
    url: function () {
        return '/page/account';
    },
    title: 'Compte',
    change: function (callback) {
        LOCA.accountCtrl.loadData(callback);
    }
};

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

LOCA.routes.owner = {
    url: function () {
        return '/page/owner';
    },
    title: 'Bailleur',
    change: function (callback) {
        if (!LOCA.ownerCtrl.alreadyLoaded) {
            LOCA.ownerCtrl.alreadyLoaded = true;
            LOCA.ownerCtrl.startUp();
        }
        LOCA.ownerCtrl.loadData(callback);
    }
};

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
