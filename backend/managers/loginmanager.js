'use strict';

var bcrypt = require('bcryptjs'),
    logger = require('winston'),
    passport = require('passport'),
    config = require('../../config').default,
    accountModel = require('../models/account'),
    realmModel = require('../models/realm'),
    ResponseTypes = {
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

function createRealm(name, email, callback) {
    var newRealm = {
        name: name,
        creation: new Date(),
        administrator: email
    };

    realmModel.add(newRealm, function(err, dbRealm) {
        if (callback) {
            callback(err, dbRealm);
        }
    });
}

function checkRealmAccess(email, callback) {
    realmModel.findByEmail(email, function(err, realms) {
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

function createAccountIfNotExist(firstname, lastname, email, realmName, password, callback) {
    function checkNotExistingAccount(email, done) {
        accountModel.findOne(email, function(err, account) {
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
        bcrypt.hash(password, 10, function(err, hash) {
            var account;
            if (err) {
                logger.error(ResponseTypes.ENCRYPT_ERROR + ': ' + err);
                done({status: ResponseTypes.ENCRYPT_ERROR});
                return;
            }

            account = {
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
            createRealm(realmName || '__default_', email, function(error, newRealm) {
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

module.exports.authenticate = function(email, password, done) {
    if (!email || !password) {
        logger.info('Login failed ' + ResponseTypes.MISSING_FIELD);
        done(ResponseTypes.MISSING_FIELD);
        return;
    }

    email = email.toLowerCase();

    accountModel.findOne(email, function(err, account) {
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

        bcrypt.compare(password, account.password, function(error, status) {
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
            checkRealmAccess(email, function(err, realms) {
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
};

logger.log('subscription ' + config.subscription);
if (config.subscription) {
    module.exports.signup = function(req, res) {
        var email = req.param('email'),
            password = req.param('password'),
            firstname = req.param('firstname'),
            lastname = req.param('lastname');

        logger.info('Request new account: ' + email);

        if (!email || !password || !firstname || !lastname) {
            res.json({
                status: ResponseTypes.MISSING_FIELD
            });
            logger.info(ResponseTypes.MISSING_FIELD);
            return;
        }

        createAccountIfNotExist(firstname, lastname, email.toLowerCase(), null, password, (err, account) => {
            if (err) {
                res.json(err);
                return;
            }
            res.json(account);
        });
    };
}

if (config.demomode) {
    module.exports.loginDemo = function(req, res) {
        const firstname = 'Camel';
        const lastname = 'Aissani';
        const email = 'demo@demo.com';
        const realmName = 'demo';
        const password = 'demo';

        function logIn(user) {
            req.logIn(user, function(err) {
                if (err) {
                    logger.info('Login failed ' + err);
                    res.redirect('/');
                    return;
                }
                logger.info('Login successful ' + email);
                res.redirect('/loggedin');
            });
        }

        createAccountIfNotExist(firstname, lastname, email, realmName, password, (err, account) => {
            if ((err && err.status !== ResponseTypes.EMAIL_TAKEN) && !account) {
                logger.info('Login failed', err);
                res.redirect('/');
                return;
            }

            checkRealmAccess(email, function(err, realms) {
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
                    createRealm('demo', 'demo@demo.com', function(err) {
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
    module.exports.login = function(req, res, next) {
        passport.authenticate('local', (err, user/*, info*/) => {
            if (err) {
                return next(err);
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                res.json({status: ResponseTypes.SUCCESS});
            });
        })(req, res, next);
    };
}

module.exports.logout = function(req, res) {
    logger.info('Logout and redirect to /');
    req.logout();
    req.session = null;
    res.redirect('/');
};

module.exports.selectRealm = function(req, res) {
    realmModel.findOne(req.body.id, function(err, realm) {
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
};
