import $ from 'jquery';
import moment from 'moment';
import i18next from 'i18next';
import Form from '../form';

const domSelector = '#contract-documents-form';

class ContractDocumentsForm extends Form {
    constructor() {
        super({
            domSelector,
            uri: '',
            manifest: {
                'name_0': {
                    minlength: 2
                },
                'expirationDate_0': {
                    required: {
                        depends: () => $(domSelector + ' #name_0').val().trim() !== ''
                    },
                    date: true
                }
            },
            defaultData: {
                _id: '',
                occupantId: '',
                documents: [{name:'', expirationDate:''}]
            }
        });
    }

    beforeSetData(args) {
        const occupant = args[0];

        this.documentRowCount=0;

        if (occupant.documents) {
            occupant.documents.forEach((doc, index) => {
                if (doc.expirationDate) {
                    doc.expirationDate = moment(doc.expirationDate).format('L'); //db formtat to display one
                }
                if (index !==0) { // Except first one row still exists
                    this.addDocumentRow();
                }
            });
        }
    }

    afterSetData(args) {
        const occupant = args[0];

        $(domSelector + ' #occupantNameLabel').html(i18next.t('\'s documents', {name:occupant.name}));
    }

    onGetData(data) {
        if (data.documents) {
            data.documents.forEach((doc) => {
                if (doc.expirationDate) {
                    doc.expirationDate = moment(doc.expirationDate, 'L').toDate(); //display format to db one
                }
            });
        }
        return data;
    }

    onBind() {
        // Dynamic property rows
        $(domSelector + ' #btn-add-document').click(() => {
            this.addDocumentRow();
            return false;
        });

        // Remove dynamic rows
        $(domSelector + ' .js-btn-form-remove-row').click(function() {
            const $row = $(this).parents('.js-form-row');
            if (!$row.hasClass('js-master-form-row')) {
                $row.remove();
            }
            else {
                $(domSelector + ' #name_0').val('');
                $(domSelector + ' #expirationDate_0').val('');
            }
            return false;
        });

        // TODO: Put this in css
        //$(domSelector + ' .js-master-form-row .js-btn-form-remove-row').hide();
    }

    addDocumentRow() {
        // Create new property row
        this.documentRowCount++;
        const $newRow = $(domSelector + ' #documents .js-master-form-row').clone(true).removeClass('js-master-form-row');
        $('.has-error', $newRow).removeClass('has-error');
        $('label.error', $newRow).remove();
        const itemDocumentName = 'name_'+this.documentRowCount;
        const itemExpirtationDateName = 'expirationDate_'+this.documentRowCount;
        $('#name_0',$newRow).attr('id', itemDocumentName).attr('name', itemDocumentName).val('');
        $('#expirationDate_0',$newRow).attr('id', itemExpirtationDateName).attr('name', itemExpirtationDateName).val('');
        $('.js-btn-form-remove-row',$newRow).show();
        // Add new property row in DOM
        $(domSelector + ' #documents').append($newRow);

        //Add jquery validation rules for new added fields
        $('#'+itemDocumentName, $newRow).rules('add', {
            required:true,
            minlength: 2
        });

        $('#'+itemExpirtationDateName, $newRow).rules('add', {
            required: true,
            date: true
        });
    }
}

export default ContractDocumentsForm;
