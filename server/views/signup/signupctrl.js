LOCA.signupCtrl = (function() {
    function SignupCtrl() {}

    // SUBOBJECT OF FORM
    SignupCtrl.prototype = Object.create(LOCA.Form.prototype);
    SignupCtrl.prototype.constructor = SignupCtrl;


    // METHODS TO OVERRIDE
    SignupCtrl.prototype.getDomSelector = function() {
        return '#signup-form';
    };

    SignupCtrl.prototype.getAddUrl = function() {
        return '/signup';
    };

    SignupCtrl.prototype.getManifest = function() {
        return {
            'firstname': {
                required: true
            },
            'lastname': {
                required: true
            },
            'username': {
                required: true,
                email: true
            },
            'password': {
                required: true
            }
        };
    };

    return SignupCtrl;
})();