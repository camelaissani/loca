const config = require('../../../config');

module.exports = () => {
  if (!config.demoMode) {
    return {
      id: 'signin',
      public: true,
    };
  }
};
