LOCA.SelectRealmCtrl = (function() {

    // SelectRealmCtrl extends Controller
    function SelectRealmCtrl() {
        LOCA.ViewController.call(this, {
            domViewId : '#view-selectrealm'
        });
    }
    SelectRealmCtrl.prototype = Object.create(LOCA.ViewController);
    SelectRealmCtrl.prototype.constructor = SelectRealmCtrl;

    // SelectRealmCtrl.prototype.initTemplates = function() {
    // };

    SelectRealmCtrl.prototype.startUp = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.startUp.call(this, callback);
    };

    SelectRealmCtrl.prototype.pageExit = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.pageExit.call(this, callback);
    };

    SelectRealmCtrl.prototype.loadData = function() {};

    // SelectRealmCtrl.prototype.loadList = function(callback) {
    //     // Call parent
    //     LOCA.ViewController.prototype.loadList.call(this, callback);
    // };

    // SelectRealmCtrl.prototype.getSelectedIds = function() {
    //     // Call parent
    //     LOCA.ViewController.prototype.getSelectedIds.call(this);
    // };

    // SelectRealmCtrl.prototype.scrollToVisible = function(selector) {
    //     // Call parent
    //     LOCA.ViewController.prototype.scrollToVisible.call(this, selector);
    // };

    // SelectRealmCtrl.prototype.openForm = function(id) {
    //     // Call parent
    //     LOCA.ViewController.prototype.openForm.call(this, id);
    // };

    // SelectRealmCtrl.prototype.closeForm = function(id) {
    //     // Call parent
    //     LOCA.ViewController.prototype.closeForm.call(this, id);
    // };

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