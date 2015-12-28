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
    OwnerCtrl.prototype = Object.create(LOCA.ViewController.prototype);
    OwnerCtrl.prototype.constructor = OwnerCtrl;

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

    return new OwnerCtrl();
})(window.$);