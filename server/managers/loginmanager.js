'use strict';

var bcrypt = require('bcryptjs'),
    logger = require('winston'),
    realmManager = require('./realmmanager'),
    db = require('../modules/db'),
    OF = require('../modules/objectfilter'),
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

var schema = new OF({
    email: String,
    password: String,
    firstname: String,
    lastname: String,
    creation: String
});

var createRealm = function(name, email, callback) {
    var newRealm = {
        name: name,
        creation: new Date(),
        administrator: email
    };

    realmManager.add(newRealm, function(err, dbRealm) {
        if (callback) {
            callback(err, dbRealm);
        }
    });
};

var checkUserMemberOfRealm = function(email, realms) {
    var realmsFound;
    realmsFound = realms.filter(function(realm) {
        if (realm.administrator === email ||
            realm.user1 === email ||
            realm.user2 === email ||
            realm.user3 === email ||
            realm.user4 === email ||
            realm.user5 === email ||
            realm.user6 === email ||
            realm.user7 === email ||
            realm.user8 === email ||
            realm.user9 === email ||
            realm.user10 === email) {
            return true;
        }
    });
    return realmsFound;
};

module.exports.signup = function(req, res) {
    var email = req.param('email'),
        password = req.param('password'),
        firstname = req.param('firstname'),
        lastname = req.param('lastname');

    var checkNotExistingAccount = function(success) {
            module.exports.findOne(email, function(err, account) {
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
                module.exports.add(account, callback);
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

module.exports.loginDemo = function(req, res) {
    module.exports.login({
        param: function(attr) {
            if (attr == 'email') {
                return 'demo@demo.com';
            } else if (attr == 'secretword') {
                return 'demo';
            }
        },
        session: req.session
    }, {
        json: function(result) {
            if (result.status == ResponseTypes.SUCCESS) {
                res.redirect('/loggedin');
            } else {
                res.redirect('/logout');
            }
        }
    });
};

module.exports.login = function(req, res) {
    var email = req.param('email'),
        password = req.param('secretword');

    logger.info('Check login ' + email);

    if (!email || !password) {
        logger.info('Login failed ' + ResponseTypes.MISSING_FIELD);
        res.json({
            status: ResponseTypes.MISSING_FIELD
        });
        return;
    }

    email = email.toLowerCase();

    var checkEmailPassword = function(grantedAccess) {
        module.exports.findOne(email, function(err, account) {
            if (err) {
                logger.info('Login failed ' + ResponseTypes.DB_ERROR);
                res.json({
                    status: ResponseTypes.DB_ERROR
                });
                return;
            }

            if (!account) {
                logger.info('Login failed ' + ResponseTypes.USER_NOT_FOUND);
                res.json({
                    status: ResponseTypes.USER_NOT_FOUND
                });
                return;
            }

            bcrypt.compare(password, account.password, function(error, status) {
                if (error) {
                    logger.info('Login failed ' + ResponseTypes.ENCRYPT_ERROR);
                    res.json({
                        status: ResponseTypes.ENCRYPT_ERROR
                    });
                    return;
                }

                if (status !== true) {
                    logger.info('Login failed ' + ResponseTypes.INVALID_PASSWORD);
                    res.json({
                        status: ResponseTypes.INVALID_PASSWORD
                    });
                    return;
                }
                grantedAccess(account);
            });
        });
    };

    var checkRealmAccess = function(account, grantedAccess) {
        realmManager.findAll(function(err, realms) {
            var realmsFound;

            if (err) {
                logger.info('Login failed ' + ResponseTypes.DB_ERROR);
                res.json({
                    status: ResponseTypes.DB_ERROR
                });
                return;
            }

            if (!realms) {
                realms = [];
            }

            realmsFound = checkUserMemberOfRealm(email, realms);

            grantedAccess(realmsFound);
        });
    };

    checkEmailPassword(function(account) {
        logger.info('Login successful ' + email);
        checkRealmAccess(account, function(realms) {
            if (!realms || realms.length === 0) {
                res.json({
                    status: ResponseTypes.REALM_NOT_FOUND
                });
                logger.error('No realm found for ' + email);
                return;
            }

            req.session.user = {
                firstname: account.firstname,
                lastname: account.lastname,
                email: email,
                realms: realms
            };
            if (realms.length === 1) {
                req.session.user.realm = realms[0];
                logger.info('Only 1 realm found. Select realm ' + req.session.user.realm.name + ' for ' + email);
            } else {
                delete req.session.user.realm;
                logger.info('Found ' + realms.length + ' realms for ' + email);
            }
            res.json({
                status: ResponseTypes.SUCCESS
            });
        });
    });
};

module.exports.logout = function(req, res) {
    req.session = null;
    res.redirect('/');
    logger.info('Logout and redirect to /');
};

module.exports.selectRealm = function(req, res) {
    realmManager.findOne(req.body.id, function(err, realm) {
        if (err) {
            res.json({
                status: ResponseTypes.DB_ERROR
            });
            return;
        }
        req.session.user.realm = realm;
        logger.info('Switch to realm ' + realm.name + ' for ' + req.session.user.email);
        res.json({
            status: ResponseTypes.SUCCESS
        });
    });
};

module.exports.findOne = function(email, callback) {
    db.listWithFilter(null, 'accounts', {
        email: email.toLowerCase()
    }, function(errors, accounts) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else if (!accounts || accounts.length === 0) {
            callback(['account not found']);
        } else {
            callback(null, accounts[0]);
        }
    });
};

module.exports.findAll = function(callback) {
    db.list(null, 'accounts', function(errors, accounts) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else if (!accounts || accounts.length === 0) {
            callback(['account not found']);
        } else {
            callback(null, accounts);
        }
    });
};

module.exports.add = function(account, callback) {
    var newAccount = schema.filter(account);
    db.add(null, 'accounts', newAccount, function(errors, dbAccount) {
        if (errors && errors.length > 0) {
            callback(errors);
        } else {
            delete dbAccount.password;
            callback(null, dbAccount);
        }
    });
};