import $ from 'jquery';
import requester from '../../lib/requester';
import ViewController from '../../lib/_viewcontroller';
import application from '../../lib/application';

class SelectRealmCtrl extends ViewController {

    // SelectRealmCtrl extends Controller
    constructor() {
        super({
            domViewId : '#view-selectrealm'
        });
    }

    onInitListeners() {
        $(document).on('click', '.realm-action', function() {
            var $action = $(this),
                realmId = $action.data('id'),
                viewId;
            requester.ajax({
                type: 'POST',
                url: '/api/selectrealm',
                dataType: 'json',
                data: {id: realmId}
            },
            function(response) {
                if (response.status === 'success') {
                    if (window.location.pathname ===  '/selectrealm') {
                        window.location = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + '/index';
                    } else {
                        viewId = application.getViewFromQueryString(window.location);
                        window.location = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + '/index?view='+viewId;
                    }
                }
            });
            return false;
        });
    }
}

export default new SelectRealmCtrl();
