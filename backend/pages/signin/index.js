import config from '../../../config';

export default () => {
    if (!config.demomode) {
        return {
            id: 'signin',
            public: true
        };
    }
};