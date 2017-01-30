import $ from 'jquery';
import ViewController from '../../lib/_viewcontroller';
import anilayout from '../../lib/anilayout';
import requester from '../../lib/requester';
import OwnerForm from './ownerform';

class OwnerCtrl extends ViewController {

    constructor() {
        super({
            domViewId: '#view-owner'
        });
        this.form = new OwnerForm();
        this.edited = false;
    }

    dataChanged(callback) {
        var data;
        this.form.bindForm();

        requester.ajax({
            type: 'GET',
            url: '/api/owner'
        },
        (owner) => {
            this.form.setData(owner);
            data = this.form.getData();
            if (!this.edited) {
                if (data._id && data._id !== '') {
                    this.closeForm();
                }
                else {
                    this.openForm();
                }
            }
            else {
                this.openForm();
            }

            if (callback) {
                callback();
            }
        });
    }

    openForm() {
        this.edited = true;
        $('#owner-form select').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
        $('#owner-form input').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
        anilayout.showMenu('owner-form-menu');
    }

    closeForm() {
        this.edited = false;
        $('#owner-form select').attr('readonly', true).attr('disabled', true).addClass('uneditable-input');
        $('#owner-form input').attr('readonly', true).attr('disabled', true).addClass('uneditable-input');
        anilayout.showMenu('owner-menu');
    }

    onUserAction($action, actionId) {
        if (actionId==='edit-owner') {
            this.openForm();
        }
        else if (actionId==='save-form') {
            this.form.submit((/*errors*/) => {
                this.closeForm();
            });
        }
    }

}

export default new OwnerCtrl();
