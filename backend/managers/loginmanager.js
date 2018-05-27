'use strict';

const bcrypt = require('bcryptjs');
const logger = require('winston');
const passport = require('passport');
const config = require('../../config');
const accountModel = require('../models/account');
const realmModel = require('../models/realm');

const ResponseTypes = {
    SUCCESS: 'success',
    DB_ERROR: 'db-error',
    ENCRYPT_ERROR: 'encrypt-error',
    MISSING_FIELD: 'missing-field',
    USER_NOT_FOUND: 'login-user-not-found',
    INVALID_PASSWORD: 'login-invalid-password',
    INVALID_REALM: 'login-invalid-realm',
    REALM_NOT_FOUND: 'login-realm-not-found',
    REALM_TAKEN: 'signup-realm-taken',
    EMAIL_TAKEN: 'signup-email-taken'
};

function _createRealm(name, email, callback) {
    const newRealm = {
        name: name,
        creation: new Date(),
        administrator: email
    };

    realmModel.add(newRealm, (err, dbRealm) => {
        if (callback) {
            callback(err, dbRealm);
        }
    });
}

function _checkRealmAccess(email, callback) {
    realmModel.findByEmail(email, (err, realms) => {
        if (err) {
            callback(err);
            return;
        }

        if (!realms) {
            realms = [];
        }

        callback(null, realms);
    });
}

function _createAccountIfNotExist(firstname, lastname, email, realmName, password, callback) {
    function checkNotExistingAccount(email, done) {
        accountModel.findOne(email, (err, account) => {
            if (err) {
                logger.error(ResponseTypes.DB_ERROR);
                done({status: ResponseTypes.DB_ERROR});
                return;
            }
            if (account) {
                logger.info(ResponseTypes.EMAIL_TAKEN);
                done({status: ResponseTypes.EMAIL_TAKEN});
                return;
            }
            // no account found
            done();
        });
    }

    function createAccount(firstname, lastname, email, password, done) {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                logger.error(ResponseTypes.ENCRYPT_ERROR + ': ' + err);
                done({status: ResponseTypes.ENCRYPT_ERROR});
                return;
            }

            const account = {
                email: email.toLowerCase(),
                password: hash,
                firstname: firstname,
                lastname: lastname
            };
            accountModel.add(account, done);
        });
    }

    checkNotExistingAccount(email, (err) => {
        if (err) {
            callback(err);
            return;
        }
        createAccount(firstname, lastname, email, password, (err) => {
            if (err) {
                logger.error(ResponseTypes.DB_ERROR + ': ' + err);
                callback({status: ResponseTypes.DB_ERROR});
                return;
            }
            logger.info('Create realm on the fly for new user ' + email);
            _createRealm(realmName || '__default_', email, (error, newRealm) => {
                if (error) {
                    logger.info('Login failed ' + ResponseTypes.DB_ERROR);
                    callback({status: ResponseTypes.DB_ERROR});
                    return;
                }
                callback(null, {
                    account: {
                        firstname: firstname,
                        lastname: lastname,
                        email: email,
                        realm: newRealm
                    },
                    status: ResponseTypes.SUCCESS
                });
            });
        });
    });
}

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
const loginManager = {
    authenticate(email, password, done) {
        if (!email || !password) {
            logger.info('Login failed ' + ResponseTypes.MISSING_FIELD);
            done(ResponseTypes.MISSING_FIELD);
            return;
        }

        email = email.toLowerCase();

        accountModel.findOne(email, (err, account) => {
            if (err) {
                logger.info('Login failed ' + ResponseTypes.DB_ERROR);
                done(ResponseTypes.DB_ERROR);
                return;
            }

            if (!account) {
                logger.info('Login failed ' + ResponseTypes.USER_NOT_FOUND);
                done(ResponseTypes.USER_NOT_FOUND);
                return;
            }

            bcrypt.compare(password, account.password, (error, status) => {
                if (error) {
                    logger.info('Login failed ' + ResponseTypes.ENCRYPT_ERROR);
                    done(ResponseTypes.ENCRYPT_ERROR);
                    return;
                }

                if (status !== true) {
                    logger.info('Login failed ' + ResponseTypes.INVALID_PASSWORD);
                    done(ResponseTypes.INVALID_PASSWORD);
                    return;
                }

                logger.info('Login successful ' + email);
                _checkRealmAccess(email, (err, realms) => {
                    if (err) {
                        logger.error(ResponseTypes.DB_ERROR + ': ' + err);
                        done(ResponseTypes.DB_ERROR);
                        return;
                    }

                    if (realms.length === 0) {
                        logger.error('No realm found for ' + email);
                        done(ResponseTypes.REALM_NOT_FOUND);
                        return;
                    }

                    logger.info('Found ' + realms.length + ' realms for ' + email);
                    const user = {
                        firstname: account.firstname,
                        lastname: account.lastname,
                        email: email,
                        realms: realms,
                        realm: realms.length>0 ? realms[0] : undefined
                    };
                    done(null, user);
                });
            });
        });
    },

    logout(req) {
        req.logout();
        req.session = null;
    },

    selectRealm(req, res) {
        realmModel.findOne(req.params.id, (err, realm) => {
            if (err) {
                res.json({
                    status: ResponseTypes.DB_ERROR
                });
                return;
            }
            req.session.realmId = realm._id;
            logger.info('Switch to realm ' + realm.name + ' for ' + req.user.email);
            res.json({
                status: ResponseTypes.SUCCESS
            });
        });
    },

    getUserByEmail(email, callback) {
        accountModel.findOne(email, (err, user) => {
            if (err) {
                callback(err);
                return;
            }
            callback(err, user);
        });
    },

    updateRequestWithRealmsOfUser(req, res, next) {
        if (!req.user) {
            delete req.realm;
            delete req.realms;
            next();
            return;
        }

        realmModel.findByEmail(req.user.email, (err, realms) => {
            if (err) {
                next(err);
                return;
            }
            if (realms) {
                req.realms = realms;
                if (req.session && req.session.realmId) {
                    const filteredDbRealms = req.realms.filter(realm =>
                        realm._id.toString() === req.session.realmId
                    );
                    if (filteredDbRealms.length > 0) {
                        req.realm = filteredDbRealms[0];
                    }
                }
                if (!req.realm) {
                    req.realm = realms[0];
                }
            } else {
                delete req.realms;
            }
            next();
        });
    }
};

if (config.subscription) {
    loginManager.signup = function(req, res) {
        const email = req.param('email');
        const password = req.param('password');
        const firstname = req.param('firstname');
        const lastname = req.param('lastname');

        logger.info('Request new account: ' + email);

        if (!email || !password || !firstname || !lastname) {
            res.json({
                status: ResponseTypes.MISSING_FIELD
            });
            logger.info(ResponseTypes.MISSING_FIELD);
            return;
        }

        _createAccountIfNotExist(firstname, lastname, email.toLowerCase(), null, password, (err, account) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(account);
        });
    };
}

if (config.demomode) {
    loginManager.loginDemo = function(req, res) {
        const firstname = 'Camel';
        const lastname = 'Aissani';
        const email = 'demo@demo.com';
        const realmName = 'demo';
        const password = 'demo';

        function logIn(user) {
            req.logIn(user, (err) => {
                if (err) {
                    logger.info('Login failed ' + err);
                    res.redirect('/');
                    return;
                }
                logger.info('Login successful ' + email);
                res.redirect('/signedin');
            });
        }

        _createAccountIfNotExist(firstname, lastname, email, realmName, password, (err, account) => {
            if ((err && err.status !== ResponseTypes.EMAIL_TAKEN) && !account) {
                logger.info('Login failed', err);
                res.redirect('/');
                return;
            }

            _checkRealmAccess(email, (err, realms) => {
                if (err) {
                    logger.info('Login failed', ResponseTypes.DB_ERROR, err);
                    res.redirect('/');
                    return;
                }

                const user = {
                    firstname,
                    lastname,
                    email
                };

                if (realms.length === 0) {
                    _createRealm('demo', 'demo@demo.com', (err) => {
                        if (err) {
                            logger.info('failed to create realm ' + ResponseTypes.DB_ERROR);
                            res.redirect('/');
                            return;
                        }
                        logIn(user);
                    });
                } else {
                    logIn(user);
                }
            });
        });
    };
} else {
    loginManager.login = function(req, res, next) {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                res.json({status: info.message});
                return;
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.json({status: ResponseTypes.SUCCESS});
            });
        })(req, res, next);
    };
}

module.exports = loginManager;
