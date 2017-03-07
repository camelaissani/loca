import $ from 'jquery';
import Handlebars from 'handlebars';
import bootbox from 'bootbox';
import i18next from 'i18next';
import requester from '../../lib/requester';
import ViewController from '../../lib/_viewcontroller';
import PropertyForm from './propertyform';

class PropertyCtrl extends ViewController {
    // PropertyCtrl extends Controller
    constructor() {
        super({
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
        this.form = new PropertyForm();
    }

    onInitTemplates() {
        // Handlebars templates
        var $propertiesSelected = $('#view-property-selected-list-template');
        if ($propertiesSelected.length >0) {
            this.templateSelectedRow = Handlebars.compile($propertiesSelected.html());
        }
    }

    onUserAction($action, actionId) {
        var selection = [];
        var selectionIds;


        selection = this.list.getSelectedData();

        if (actionId==='list-action-edit-property') {
            this.form.setData(selection[0]);
            this.openForm('property-form');
        }
        else if (actionId==='list-action-add-property') {
            this.list.unselectAll();
            this.form.setData(null);
            this.openForm('property-form');
        }
        else if (actionId==='list-action-remove-property') {
            bootbox.confirm(i18next.t('Are you sure to remove this property'), (result) => {
                if (!result) {
                    return;
                }
                selectionIds = [];
                for (var index=0; index < selection.length; ++index) {
                    selectionIds.push(selection[index]._id);
                }
                requester.ajax({
                    type: 'GET',
                    url: `/api/properties/remove/${selectionIds.join()}`,
                },
                (response) => {
                    if (!response.errors || response.errors.length===0) {
                        this.list.unselectAll();
                        this.loadList(() => {
                            this.closeForm();
                        });
                    }
                });
            });
        }
        else if (actionId==='list-action-save-form') {
            this.form.submit((data) => {
                this.closeForm(() => {
                    this.loadList(() => {
                        this.list.select($('.list-row#'+data._id), true);
                        this.scrollToVisible();
                    });
                });
            });
        }
    }

    onDataChanged(callback) {
        this.form.bindForm();
        if (callback) {
            callback();
        }
    }

}

export default new PropertyCtrl();
