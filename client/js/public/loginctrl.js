LOCA.loginCtrl = (function() {
    function LoginCtrl() {}

    // SUBOBJECT OF FORM
    LoginCtrl.prototype = new LOCA.Form();

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