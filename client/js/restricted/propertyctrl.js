LOCA.propertyCtrl = (function($, Handlebars, bootbox){
    var self;

    // PropertyCtrl extends Controller
    function PropertyCtrl() {
        self = this;
        self.form = new LOCA.PropertyForm();
        // Call super constructor
        LOCA.ViewController.call(this, {
            domViewId: '#view-property',
            domListId: '#properties',
            listSelectionMenuId: 'properties-selection-menu',
            urls: {
                overview: '/api/properties/overview',
                items: '/api/properties'
            }
        });
    }
    PropertyCtrl.prototype = Object.create(LOCA.ViewController);
    PropertyCtrl.prototype.constructor = PropertyCtrl;

    PropertyCtrl.prototype.initTemplates = function() {
        // Handlebars templates
        var $propertiesSelected = $('#view-property #properties-selected-template');
        if ($propertiesSelected.length >0) {
            self.templateSelectedRow = Handlebars.compile($propertiesSelected.html());
        }
    };

    PropertyCtrl.prototype.startUp = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.startUp.call(this, callback);
    };

    PropertyCtrl.prototype.pageExit = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.pageExit.call(this, callback);
    };

    PropertyCtrl.prototype.loadData = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.loadData.call(this, callback);
    };

    PropertyCtrl.prototype.loadList = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.loadList.call(this, callback);
    };

    PropertyCtrl.prototype.getSelectedIds = function() {
        // Call parent
        return LOCA.ViewController.prototype.getSelectedIds.call(this);
    };

    PropertyCtrl.prototype.scrollToVisible = function(selector) {
        // Call parent
        LOCA.ViewController.prototype.scrollToVisible.call(this, selector);
    };

    PropertyCtrl.prototype.openForm = function(id) {
        // Call parent
        LOCA.ViewController.prototype.openForm.call(this, id);
    };

    PropertyCtrl.prototype.closeForm = function(id) {
        // Call parent
        LOCA.ViewController.prototype.closeForm.call(this, id);
    };

    PropertyCtrl.prototype.onUserAction = function($action, actionId) {
        var selection = [];
        var selectionIds;


        selection = self.list.getSelectedData();

        if (actionId==='list-action-edit-property') {
            self.form.setData(selection[0]);
            self.openForm('property-form');
        }
        else if (actionId==='list-action-add-property') {
            self.list.unselectAll();
            self.form.setData(null);
            self.openForm('property-form');
        }
        else if (actionId==='list-action-remove-property') {
            bootbox.confirm('Êtes-vous sûr de vouloir supprimer ce bien ?', function(result) {
                if (!result) {
                    return;
                }
                selectionIds = [];
                for (var index=0; index < selection.length; ++index) {
                    selectionIds.push(selection[index]._id);
                }
                LOCA.requester.ajax({
                    type: 'POST',
                    url: '/properties/remove',
                    data: {ids: selectionIds},
                    dataType: 'json'
                },
                function(response) {
                    if (response.errors.length===0) {
                        self.list.unselectAll();
                        self.loadList(function() {
                            self.closeForm();
                        });
                    }
                });
            });
        }
        else if (actionId==='list-action-save-form') {
            self.form.submit(function(data) {
                self.closeForm(function() {
                    self.loadList(function() {
                        self.closeForm(function() {
                            self.list.select($('.list-row#'+data._id), true);
                            self.scrollToVisible();
                        });
                    });
                });
            });
        }
    };

    PropertyCtrl.prototype.initListeners = function() {
        // Call parent
        LOCA.ViewController.prototype.initListeners.call(this);
    };

    PropertyCtrl.prototype.onLoadData = function(callback) {
        self.form.bindForm();
        if (callback) {
            callback();
        }
    };

    return new PropertyCtrl();
})(window.$, window.Handlebars, window.bootbox);