const config = require('../../../config');

module.exports = () => {
    if (config.signup) {
        return {
            id:'signup',
            public: true
        };
    }
};