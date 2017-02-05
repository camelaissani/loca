import config from '../../config';

export default {
    computeRent: require(`./${config.businesslogic}/computeRent`).default
};
