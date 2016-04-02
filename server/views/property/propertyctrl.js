LOCA.propertyCtrl = (function($, Handlebars, bootbox, i18next){
    var self;

    // PropertyCtrl extends Controller
    function PropertyCtrl() {
        self = this;
        self.form = new LOCA.PropertyForm();
        // Call super constructor
        LOCA.ViewController.call(this, {
            domViewId: '#view-property',
            domListId: '#properties',
            defaultMenuId: 'properties-menu',
            listSelectionLabel: 'Selected property',
            listSelectionMenuId: 'properties-selection-menu',
            urls: {
                overview: '/api/properties/overview',
                items: '/api/properties'
            }
        });
    }
    PropertyCtrl.prototype = Object.create(LOCA.ViewController.prototype);
    PropertyCtrl.prototype.constructor = PropertyCtrl;

    PropertyCtrl.prototype.onInitTemplates = function() {
        // Handlebars templates
        var $propertiesSelected = $('#view-property-selected-list-template');
        if ($propertiesSelected.length >0) {
            self.templateSelectedRow = Handlebars.compile($propertiesSelected.html());
        }
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
            bootbox.confirm(i18next.t('Are you sure to remove this property'), function(result) {
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
                        self.list.select($('.list-row#'+data._id), true);
                        self.scrollToVisible();
                    });
                });
            });
        }
    };

    PropertyCtrl.prototype.onDataChanged = function(callback) {
        self.form.bindForm();
        if (callback) {
            callback();
        }
    };

    return new PropertyCtrl();
})(window.$, window.Handlebars, window.bootbox, window.i18next);
