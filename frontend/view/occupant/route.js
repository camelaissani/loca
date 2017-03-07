import i18next from 'i18next';
import {LOCA} from '../../lib/main';
import occupantCtrl from './occupantctrl';

export default () => {
    LOCA.routes.occupant = {
        url() {
            return '/view/occupant';
        },
        title: i18next.t('Tenants'),
        pageInitialized(callback) {
            occupantCtrl.pageInitialized(callback);
        },
        dataChanged(callback) {
            occupantCtrl.dataChanged(callback);
        },
        pageExited(callback) {
            occupantCtrl.pageExited(callback);
        }
    };
};
