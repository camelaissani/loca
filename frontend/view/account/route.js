import i18next from 'i18next';
import {LOCA} from '../../lib/main';
import accountCtrl from './accountctrl';

export default () => {
    LOCA.routes.account = {
        url() {
            return '/page/account';
        },
        title: i18next.t('Account'),
        pageInitialized(callback) {
            accountCtrl.pageInitialized(callback);
        },
        dataChanged(callback) {
            accountCtrl.dataChanged(callback);
        }
    };
};
