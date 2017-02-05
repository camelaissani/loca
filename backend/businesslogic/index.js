import config from '../../config';

export default {
    rent: require(`./${config.businesslogic}/rent`).default
};
