(function($, i18next) {
    function applicationReady(/*event*/) {
        var $container,
            location,
            loginForm,
            signupForm;

        $container = $('.view-container');
        location = window.location;

        if (location.pathname ===  '/login')  {
            loginForm = new LOCA.loginCtrl();
            loginForm.bindForm();
            $('#login-send').click(function() {
                loginForm.submit(function(response) {
                    var message;

                    if (response.status === 'success') {
                        $('#login-form').submit(); // Add this to allow browsers to store username and password. Also I do redirect to home page server side look at /loggedin
                        return;
                    }

                    if (response.status === 'login-user-not-found') {
                        message = i18next.t('Unknown user');
                    } else if (response.status === 'login-invalid-password') {
                        message = i18next.t('Bad password');
                    } else if (response.status === 'login-realm-not-found') {
                        message = i18next.t('This user does not manage any real estate accounts');
                    } else if (response.status === 'missing-field') {
                        message = i18next.t('Please fill missing fields');
                    } else {
                        message = i18next.t('A technical issue has occured (-_-\')');
                    }
                    loginForm.showErrorMessage(message);
                });
                return false;
            });
        }
        else if (location.pathname === '/signup') {
            signupForm = new LOCA.signupCtrl();
            signupForm.bindForm();
            $('#signup-send').click(function() {
                signupForm.submit(function(response) {
                    var message;

                    if (response.status === 'success') {
                        $('#signup-form').submit(); // Add this to allow browsers to store username and password. Also I do redirect to home page server side look at /signededin
                        return;
                    }

                    if (response.status === 'missing-field') {
                        message = i18next.t('Please fill missing fields');
                    } else if (response.status === 'signup-email-taken') {
                        message = i18next.t('This user already exists');
                    } else {
                        message = i18next.t('A technical issue has occured (-_-\')');
                    }

                    signupForm.showErrorMessage(message);
                });
                return false;
            });
        }
        $container.css('visibility','visible');
        $container.css('opacity',1);
    }

    document.addEventListener('languageChanged', function(/*event*/) {
        LOCA.updateLanguageScript(LOCA.countryCode, 'jquery-validate-language', '//ajax.aspnetcdn.com/ajax/jquery.validate/1.13.1/localization/messages_' + LOCA.countryCode + '.js', function() {
            applicationReady();
        });
    });
})(window.$, window.i18next);