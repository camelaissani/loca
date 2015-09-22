(function($) {
    $(document).ready(function () {
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
                        message = 'Utilisateur inconnu.';
                    } else if (response.status === 'login-invalid-password') {
                        message = 'Mot de passe incorrect.';
                    } else if (response.status === 'login-realm-not-found') {
                        message = 'Connexion à votre compte est non autorisée. Actuellement vous ne gérez aucun bien immobilier.';
                    } else if (response.status === 'missing-field') {
                        message = 'Veuillez completer tous les champs.';
                    } else {
                        message = 'Une erreur technique s\'est produite.';
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
                        message = 'Veuillez completer tous les champs.';
                    } else if (response.status === 'signup-email-taken') {
                        message = 'Le compte utilisateur existe déjà.';
                    } else {
                        message = 'Une erreur technique s\'est produite.';
                    }

                    signupForm.showErrorMessage(message);
                });
                return false;
            });
        }
        $container.css('visibility','visible');
        $container.css('opacity',1);
    });
})(window.$);