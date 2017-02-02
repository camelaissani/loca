const config = require('../config').default;
const logger = require('winston');

const allViews = [
    // 'account',
    'accounting',
    'dashboard',
    'login',
    'occupant',
    'owner',
    'property',
    'rent',
    'selectrealm',
    'signup',
    'website'
];

module.exports = function(view, req, res) {
    const model = {
        config,
        view,
        isValidView: allViews.indexOf(view) !== -1,
        isLogged: req.user ? true : false,
        isRealmSelected: req.realm ? true : false,
        isDefaultRealmSelected: req.realm && req.realm.name === '__default_',
        isMultipleRealmsAvailable: req.realms && req.realms.length > 1,
        user: req.user,
        realm: req.realm,
        realms: req.realms,
        errors: null
    };
    logger.debug(model);
    res.render('index', model);
};
