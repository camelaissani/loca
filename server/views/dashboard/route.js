import i18next from 'i18next';
import {LOCA} from '../application/main';
import dashboardCtrl from './dashboardctrl';

export default () => {
    LOCA.routes.dashboard = {
        url() {
            return '/page/dashboard';
        },
        title: i18next.t('Dashboard'),
        pageInitialized(callback) {
            dashboardCtrl.pageInitialized(callback);
        },
        dataChanged(callback) {
            dashboardCtrl.dataChanged(callback);
        },
        pageExited(callback) {
            dashboardCtrl.pageExited(callback);
        }
    };
};
