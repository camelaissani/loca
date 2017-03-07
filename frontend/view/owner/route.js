import i18next from 'i18next';
import {LOCA} from '../../lib/main';
import ownerCtrl from './ownerctrl';

export default () => {
    LOCA.routes.owner = {
        url() {
            return '/view/owner';
        },
        title: i18next.t('Landloard'),
        pageInitialized(callback) {
            ownerCtrl.pageInitialized(callback);
        },
        dataChanged(callback) {
            ownerCtrl.dataChanged(callback);
        }
    };
};
