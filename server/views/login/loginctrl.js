LOCA.loginCtrl = (function() {
    function LoginCtrl() {
        LOCA.Form.call(this);
    }

    // SUBOBJECT OF FORM
    LoginCtrl.prototype = Object.create(LOCA.Form.prototype);
    LoginCtrl.prototype.constructor = LoginCtrl;

    // METHODS TO OVERRIDE
    LoginCtrl.prototype.getDomSelector = function() {
        return '#login-form';
    };

    LoginCtrl.prototype.getAddUrl = function() {
        return '/login';
    };

    LoginCtrl.prototype.getManifest = function() {
        return {
            'username': {
                required: true,
                email: true
            },
            'password': {
                required: true
            }
        };
    };

    LoginCtrl.prototype.onGetData = function(data) {
        if (data.username) {
            data.email = data.username;
            delete data.username;
        }
        if (data.password) {
            data.secretword = data.password;
            delete data.password;
        }
        return data;
    };

    return LoginCtrl;
})();
