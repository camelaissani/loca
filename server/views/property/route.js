import i18next from 'i18next';
import {LOCA} from '../application/main';
import propertyCtrl from './propertyctrl';

export default () => {
    LOCA.routes.property = {
        url: function () {
            return '/page/property';
        },
        title: i18next.t('Properties'),
        pageInitialized: function(callback) {
            propertyCtrl.pageInitialized(callback);
        },
        dataChanged: function (callback) {
            propertyCtrl.dataChanged(callback);
        },
        pageExited: function (callback) {
            propertyCtrl.pageExited(callback);
        }
    };
};