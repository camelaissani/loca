const config = require('../../../config');

module.exports = () => {
    if (config.subscription) {
        return {
            id:'signup',
            public: true
        };
    }
};