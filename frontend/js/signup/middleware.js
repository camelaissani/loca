import $ from 'jquery';
import i18next from 'i18next';
import SignupForm from './signupform.js';
import frontexpress from 'frontexpress';

class SignupMiddleware extends frontexpress.Middleware {

    constructor() {
        super();
        this.form = new SignupForm();
    }

    // overriden
    entered() {
        $('body').addClass('covered-body');
        $('body > .footer').show();
    }

    updated() {
        this.form.bindForm();
        $('#signup-send').click(() => {
            this.form.submit((response) => {
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

export default SignupMiddleware;