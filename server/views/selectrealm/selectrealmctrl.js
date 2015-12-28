LOCA.SelectRealmCtrl = (function() {

    // SelectRealmCtrl extends Controller
    function SelectRealmCtrl() {
        LOCA.ViewController.call(this, {
            domViewId : '#view-selectrealm'
        });
    }
    SelectRealmCtrl.prototype = Object.create(LOCA.ViewController.prototype);
    SelectRealmCtrl.prototype.constructor = SelectRealmCtrl;

    SelectRealmCtrl.prototype.initListeners = function() {
        // Call parent
        LOCA.ViewController.prototype.initListeners.call(this);

        $(document).on('click', '.realm-action', function() {
            var $action = $(this),
                realmId = $action.data('id'),
                viewId;
            LOCA.requester.ajax({
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
                        viewId = LOCA.application.getViewFromQueryString(window.location);
                        window.location = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + '/index?view='+viewId;
                    }
                }
            });
        });
    };


    return new SelectRealmCtrl();
})();