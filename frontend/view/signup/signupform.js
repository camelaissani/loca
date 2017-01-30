import Form from '../../lib/form';

class SignupForm extends Form {

    // METHODS TO OVERRIDE
    getDomSelector() {
        return '#signup-form';
    }

    getAddUrl() {
        return '/signup';
    }

    getManifest() {
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
    }
}

export default SignupForm;
