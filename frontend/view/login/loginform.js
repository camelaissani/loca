import Form from '../../lib/form';

class LoginForm extends Form {
    // METHODS TO OVERRIDE
    getDomSelector() {
        return '#login-form';
    }

    getAddUrl() {
        return '/login';
    }

    getManifest() {
        return {
            'username': {
                required: true,
                email: true
            },
            'password': {
                required: true
            }
        };
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
