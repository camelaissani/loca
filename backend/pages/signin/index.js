const config = require('../../../config');

module.exports = () => {
    if (!config.demomode) {
        return {
            id: 'signin',
            public: true
        };
    }
};