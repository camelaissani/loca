'use strict';

var bcrypt = require('bcryptjs'),
    logger = require('winston'),
    passport = require('passport'),
    config = require('../../config'),
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

module.exports.signup = function(req, res) {
    var email = req.param('email'),
        password = req.param('password'),
        firstname = req.param('firstname'),
        lastname = req.param('lastname');

    var checkNotExistingAccount = function(success) {
            accountModel.findOne(email, function(err, account) {
                if (err) {
                    res.json({
                        status: ResponseTypes.DB_ERROR
                    });
                    logger.error(ResponseTypes.DB_ERROR);
                    return;
                }
                if (account) {
                    res.json({
                        status: ResponseTypes.EMAIL_TAKEN
                    });
                    logger.info(ResponseTypes.EMAIL_TAKEN);
                    return;
                }
                success();
            });
        },
        createAccount = function(callback) {
            bcrypt.hash(password, 10, function(err, hash) {
                var account;
                if (err) {
                    res.json({
                        status: ResponseTypes.ENCRYPT_ERROR
                    });
                    logger.error(ResponseTypes.ENCRYPT_ERROR + ': ' + err);
                    return;
                }

                account = {
                    email: email.toLowerCase(),
                    password: hash,
                    firstname: firstname,
                    lastname: lastname
                };
                accountModel.add(account, callback);
            });
        };

    logger.info('Request new account: ' + email);

    if (!email || !password || !firstname || !lastname) {
        res.json({
            status: ResponseTypes.MISSING_FIELD
        });
        logger.info(ResponseTypes.MISSING_FIELD);
        return;
    }

    email = email.toLowerCase();

    checkNotExistingAccount(function() {
        createAccount(function(err) {
            if (err) {
                res.json({
                    status: ResponseTypes.DB_ERROR
                });
                logger.error(ResponseTypes.DB_ERROR + ': ' + err);
                return;
            }
            logger.info('Create realm on the fly for new user ' + email);
            createRealm('__default_', email, function(error, newRealm) {
                if (error) {
                    logger.info('Login failed ' + ResponseTypes.DB_ERROR);
                    res.json({
                        status: ResponseTypes.DB_ERROR
                    });
                    return;
                }
                res.json({
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
};

if (config.demomode) {
    module.exports.loginDemo = function(req, res) {
        const email = 'demo@demo.com';

        checkRealmAccess(email, function(err, realms) {
            if (err) {
                logger.info('Login failed', ResponseTypes.DB_ERROR, err);
                res.redirect('/');
                return;
            }

            req.user = {
                firstname: 'Camel',
                lastname: 'Aissani',
                email,
                realms
            };

            if (realms.length === 0) {
                createRealm('demo', 'demo@demo.com', function(err, realm) {
                    if (err) {
                        logger.info('failed to create realm ' + ResponseTypes.DB_ERROR);
                        res.redirect('/');
                        return;
                    }
                    req.session.realms = [realm];
                    req.realm = realms[0];
                    logger.info('Login successful ' + email);
                    res.redirect('/loggedin');
                });
                return;
            }

            req.realm = realms[0];
            logger.info('Login successful ' + email);
            res.redirect('/loggedin');
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
    req.logout();
    req.session = null;
    res.redirect('/');
    logger.info('Logout and redirect to /');
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
