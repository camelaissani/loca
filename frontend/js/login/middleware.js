import $ from 'jquery';
import i18next from 'i18next';
import LoginForm from './loginform';
import frontexpress from 'frontexpress';

class LoginMiddleware extends frontexpress.Middleware {
    constructor() {
        super();
        this.form =  new LoginForm();
    }

    // overriden
    entered() {
        $('body').addClass('covered-body');
        $('body > .footer').show();
    }

    updated(req, res) {
        super.updated(req, res);

        this.form.bindForm();
        $('#login-send').click(() => {
            this.form.submit((response) => {
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
                    message = i18next.t('A technical issue has occurred (-_-\')');
                }
                this.form.showErrorMessage(message);
            });
            return false;
        });
    }

    // overriden
    exited() {
        this.form.unbindForm();
    }
}

export default LoginMiddleware;