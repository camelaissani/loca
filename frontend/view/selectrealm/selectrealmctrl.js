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
        $(document).on('click', '.js-realm-action', function() {
            const $action = $(this);
            const realmId = $action.data('id');
            requester.ajax({
                type: 'GET',
                url: `/api/realms/${realmId}`
            },
            function(response) {
                const location = window.location;
                if (response.status === 'success') {
                    if (location.pathname ===  '/selectrealm') {
                        window.location = `${location.origin}/page`;
                    } else {
                        const viewId = application.getViewFromLocation();
                        window.location = `${location.origin}/page/${viewId}`;
                    }
                }
            });
            return false;
        });
    }
}

export default new SelectRealmCtrl();
