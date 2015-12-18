LOCA.ownerCtrl = (function($) {
    var self;

    // SelectRealmCtrl extends Controller
    function OwnerCtrl() {
        self = this;
        this.form = new LOCA.OwnerForm();
        this.edited = false;
         // Call super constructor
        LOCA.ViewController.call(this, {
            domViewId: '#view-owner'
        });
    }
    OwnerCtrl.prototype = Object.create(LOCA.ViewController);
    OwnerCtrl.prototype.constructor = OwnerCtrl;

    // OwnerCtrl.prototype.initTemplates = function() {
    //
    // };

    OwnerCtrl.prototype.startUp = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.startUp.call(this, callback);
    };

    OwnerCtrl.prototype.pageExit = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.pageExit.call(this, callback);
    };

    OwnerCtrl.prototype.loadData = function(callback) {
        var data;
        self.form.bindForm();

        loadOwner(function() {
            data = self.form.getData();
            if (!self.edited) {
                if (data._id && data._id !== '') {
                    self.closeForm();
                }
                else {
                    self.openForm();
                }
            }
            else {
                self.openForm();
            }

            if (callback) {
                callback();
            }
        });
    };

    // OwnerCtrl.prototype.loadList = function(callback) {
    //     // Call parent
    //     LOCA.ViewController.prototype.loadList.call(this, callback);
    // };

    // OwnerCtrl.prototype.getSelectedIds = function() {
    //     // Call parent
    //     return LOCA.ViewController.prototype.getSelectedIds.call(this);
    // };

    // OwnerCtrl.prototype.scrollToVisible = function(selector) {
    //     // Call parent
    //     LOCA.ViewController.prototype.scrollToVisible.call(this, selector);
    // };

    OwnerCtrl.prototype.openForm = function() {
        self.edited = true;
        $('#owner-form select').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
        $('#owner-form input').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
        LOCA.layoutManager.showMenu('owner-form-menu');
    };

    OwnerCtrl.prototype.closeForm = function() {
        self.edited = false;
        $('#owner-form select').attr('readonly', true).attr('disabled', true).addClass('uneditable-input');
        $('#owner-form input').attr('readonly', true).attr('disabled', true).addClass('uneditable-input');
        LOCA.layoutManager.showMenu('owner-menu');
    };

    function loadOwner(callback) {
        LOCA.requester.ajax({
            type: 'GET',
            url: '/api/owner'
        },
        function(owner) {
            self.form.setData(owner);
            if (callback) {
                callback();
            }
        });
    }

    OwnerCtrl.prototype.onUserAction = function($action, actionId) {
        if (actionId==='edit-owner') {
            self.openForm();
        }
        else if (actionId==='save-form') {
            self.form.submit(function(/*errors*/) {
                self.closeForm();
            });
        }
    };

    OwnerCtrl.prototype.initListeners = function() {
        // Call parent
        LOCA.ViewController.prototype.initListeners.call(this);
    };

    return new OwnerCtrl();
})(window.$);