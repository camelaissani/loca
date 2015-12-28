LOCA.accountCtrl = (function() {

    // AccountCtrl extends Controller
    function AccountCtrl() {
        LOCA.ViewController.call(this, {
            domViewId: '#view-account'
        });
    }
    AccountCtrl.prototype = Object.create(LOCA.ViewController.prototype);
    AccountCtrl.prototype.constructor = AccountCtrl;

    return new AccountCtrl();
})();
