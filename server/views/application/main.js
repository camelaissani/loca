import language from './language';

const now = new Date();
export const LOCA = {
    now,
    routes: {},
    currentMonth: now.getMonth() + 1,
    currentYear: now.getFullYear(),
    countryCode: 'en_us'
};

export default () => {
    language();
};