import config from '../../../config';

export default () => {
    if (config.subscription) {
        return {
            id:'signup',
            public: true
        };
    }
};