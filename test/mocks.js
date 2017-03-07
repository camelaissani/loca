// module.exports.Logger = function() {
//     this.info = function(text) {};
//     this.error = function(text) {};
// };

// module.exports.DB = function() {
//     this.init = function() {};

//     this.addCollection = function(collection) {};

//     this.findItemById = function(realm, collection, id, callback) {};

//     this.listWithFilter = function(realm, collection, filter, callback) {};

//     this.list = function(realm, collection, callback) {};

//     this.add = function(realm, collection, item, callback) {};

//     this.updateWithFilter = function(realm, collection, filter, item, callback) {};

//     this.update = function(realm, collection, item, callback) {};

//     this.upsert = function(realm, collection, query, fieldsToSet, fieldsToSetOnInsert, callback) {};

//     this.removeWithFilter = function(realm, collection, filter, callback) {};

//     this.remove = function(realm, collection, items, callback) {};
// };

// module.exports.Model = function() {
//     this.findOne = function(realm, id, callback) {};

//     this.findFilter = function(realm, filter, callback) {};

//     this.findAll = function(realm, callback) {};

//     this.add = function(realm, item, callback) {};

//     this.updateFilter = function(realm, filter, item, callback) {};

//     this.update = function(realm, item, callback) {};

//     this.upsert = function(realm, query, fieldsToSet, fieldsToSetOnInsert, callback) {};

//     this.removeFilter = function(realm, filter, callback) {};

//     this.remove = function(realm, items, callback) {};
// };

// module.exports.RequestStrategy = function() {
//     this.mustSessionLessArea = function(req, res, next) {
//         next();
//     };

//     this.restrictedArea = function(req, res, next) {
//         req.session = {};
//         req.user = {};
//         req.realm = {};
//         next();
//     };

//     this.restrictedAreaAndRedirect = function(req, res, next) {
//         req.session = {};
//         req.user = {};
//         req.realm = {};
//         next();
//     };

//     this.mustRealmSetAndRedirect = function(req, res, next) {
//         req.session = {};
//         req.user = {};
//         req.realm = {};
//         next();
//     };

//     this.mustRealmSet = function(req, res, next) {
//         next();
//     };
// };

// module.exports.LoginManager = function() {
//     this.signup = function(req, res) {
//         res.json({});
//     };

//     this.login = function(req, res) {
//         res.json({});
//     };

//     this.logout = function(req, res) {
//         res.json({});
//     };

//     this.selectRealm = function(req, res) {
//         res.json({});
//     };

//     this.loginDemo = function(req, res) {
//         res.json({});
//     };
// };

// module.exports.DocumentManager = function() {
//     this.update = function(req, res) {
//         res.json({});
//     };
// };

// module.exports.NotificationManager = function() {
//     this.findAll = function(req, res) {
//         res.json({});
//     };
// };

// module.exports.RentManager = function() {
//     this.one = function(req, res) {
//         res.json({});
//     };

//     this.update = function(req, res) {
//         res.json({});
//     };

//     this.findOccupantRents = function(realm, id, month, year, callback) {
//         callback(null, {}, {}, []);
//     };

//     this.findAllOccupantRents = function(realm, month, year, callback) {
//         callback(null, []);
//     };
// };

// module.exports.PropertyManager = function() {
//     this.add = function(req, res) {
//         res.json({});
//     };

//     this.update = function(req, res) {
//         res.json({});
//     };

//     this.remove = function(req, res) {
//         res.json({});
//     };

//     this.findAllResources = function(realm, callback) {
//         callback(null, []);
//     };
// };

// module.exports.OccupantManager = function() {
//     this.one = function(req, res) {
//         res.json({});
//     };

//     this.add = function(req, res) {
//         res.json({});
//     };

//     this.update = function(req, res) {
//         res.json({});
//     };

//     this.remove = function(req, res) {
//         res.json({});
//     };

//     this.findAllOccupants = function(realm, callback) {
//         callback(null, []);
//     };
// };

// module.exports.OwnerManager = function() {
//     this.update = function(req, res) {
//         res.json({});
//     };

//     this.findOwner = function(realm, callback) {
//         callback(null, []);
//     };
// };

// module.exports.PrintManager = function() {
//     this.renderModel = function(req, res, callback) {
//         res.render('', {});
//     };

//     this.rentModel = function(req, res, callback) {
//         res.render('', {});
//     };
// };
