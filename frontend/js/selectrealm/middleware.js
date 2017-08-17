import $ from 'jquery';
import application from '../application';
import ViewController from '../viewcontroller';

class SelectRealmMiddleware extends ViewController {

    constructor() {
        super({
            domViewId : '#view-selectrealm'
        });
    }

    onInitListener() {
        $(document).on('click', '.js-realm-action', function() {
            const $action = $(this);
            const realmId = $action.data('id');
            application.httpGet(
                `/api/realms/${realmId}`,
                (req, res) => {
                    const response = JSON.parse(res.responseText);
                    const location = window.location;
                    if (response.status === 'success') {
                        window.location = `${location.origin}/dashboard`;
                    }
                }
            );
            return false;
        });
    }
}

export default SelectRealmMiddleware;
