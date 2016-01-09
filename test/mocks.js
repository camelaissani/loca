module.exports.DB = function() { 
    this.init = function () {
    };
    
    this.findItemById = function (realm, collection, id, callback) {
    };
    
    this.listWithFilter = function (realm, collection, filter, callback) {
    };

    this.list = function (realm, collection, callback) {
    };

    this.add = function (realm, collection, item, callback) {
    };

    this.updateWithFilter = function (realm, collection, filter, item, callback) {
    };

    this.update = function (realm, collection, item, callback) {
    };

    this.upsert = function (realm, collection, query, fieldsToSet, fieldsToSetOnInsert, callback) {
    };

    this.removeWithFilter = function (realm, collection, filter, callback) {
    };

    this.remove = function (realm, collection, items, callback) {
    };
};

module.exports.LoginManager = function() {
    this.signup = function (req, res) {
        res.json({});
    };

    this.login = function (req, res) {
        res.json({});
    };

    this.logout = function (req, res) {
        res.json({});
    };

    this.selectRealm = function (req, res) {
        res.json({});
    };
};

module.exports.RequestStrategy = function() {
    this.mustSessionLessArea = function (req, res, next) {
        next();
    };

    this.restrictedArea = function (req, res, next) {
        next();
    };

    this.restrictedAreaAndRedirect = function (req, res, next) {
        next();
    };

    this.mustRealmSetAndRedirect = function (req, res, next) {
        next();
    };

    this.mustRealmSet = function (req, res, next) {
        next();
    };
};