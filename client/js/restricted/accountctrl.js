LOCA.accountCtrl = (function() {

    // AccountCtrl extends Controller
    function AccountCtrl() {
        LOCA.ViewController.call(this, {
            domViewId: '#view-account'
        });
    }
    AccountCtrl.prototype = Object.create(LOCA.ViewController);
    AccountCtrl.prototype.constructor = AccountCtrl;

    // AccountCtrl.prototype.initTemplates = function() {
    //
    // };

    AccountCtrl.prototype.startUp = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.startUp.call(this, callback);
    };

    AccountCtrl.prototype.pageExit = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.pageExit.call(this, callback);
    };

    AccountCtrl.prototype.loadData = function() {
    };

    // AccountCtrl.prototype.loadList = function(callback) {
    //     // Call parent
    //     LOCA.ViewController.prototype.loadList.call(this, callback);
    // };

    // AccountCtrl.prototype.getSelectedIds = function() {
    //     // Call parent
    //     return LOCA.ViewController.prototype.getSelectedIds.call(this);
    // };

    // AccountCtrl.prototype.scrollToVisible = function(selector) {
    //     // Call parent
    //     LOCA.ViewController.prototype.scrollToVisible.call(this, selector);
    // };

    // AccountCtrl.prototype.openForm = function(id) {
    //     // Call parent
    //     LOCA.ViewController.prototype.openForm.call(this, id);
    // };

    // AccountCtrl.prototype.closeForm = function(id) {
    //     // Call parent
    //     LOCA.ViewController.prototype.closeForm.call(this, id);
    // };

    AccountCtrl.prototype.initListeners = function() {
        // Call parent
        LOCA.ViewController.prototype.initListeners.call(this);
    };

    return new AccountCtrl();
})();