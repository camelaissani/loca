import Form from '../form';

class SignupForm extends Form {
    constructor() {
        super({
            domSelector: '#signup-form',
            httpMethod: 'POST',
            uri: '/signup',
            manifest: {
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
            },
            alertOnFieldError: false
        });
    }
}

export default SignupForm;
