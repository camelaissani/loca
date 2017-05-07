import $ from 'jquery';
import i18next from 'i18next';

import LoginForm from '../login/loginform';
import SignupForm from '../signup/signupform';

export default {
    applicationReady(/*event*/) {
        const $container = $('.js-view-container');
        const location = window.location;

        if (location.pathname ===  '/login')  {
            const loginForm = new LoginForm();
            loginForm.bindForm();
            $('#login-send').click(() => {
                loginForm.submit((response) => {
                    let message;

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
            const signupForm = new SignupForm();
            signupForm.bindForm();
            $('#signup-send').click(() => {
                signupForm.submit((response) => {
                    let message;

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
};