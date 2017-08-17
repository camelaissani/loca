import Form from '../form';

class LoginForm extends Form {
    constructor() {
        super({
            domSelector: '#login-form',
            httpMethod: 'POST',
            uri: '/signin',
            manifest: {
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

    onGetData(data) {
        if (data.username) {
            data.email = data.username;
            delete data.username;
        }
        if (data.password) {
            data.secretword = data.password;
            delete data.password;
        }
        return data;
    }
}

export default LoginForm;
