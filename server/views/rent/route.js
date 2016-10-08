import i18next from 'i18next';
import {LOCA} from '../application/main';
import rentCtrl from './rentctrl';

export default () => {
    LOCA.routes.rent = {
        url() {
            return '/page/rent';
        },
        title: i18next.t('Rents'),
        pageInitialized(callback) {
            rentCtrl.pageInitialized(callback);
        },
        dataChanged(callback) {
            rentCtrl.dataChanged(callback);
        },
        pageExited(callback) {
            rentCtrl.pageExited(callback);
        }
    };
};