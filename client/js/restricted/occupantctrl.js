LOCA.occupantCtrl = (function($, Handlebars, bootbox) {

    var self;

    // OccupantCtrl extends Controller
    function OccupantCtrl() {
        self = this;
        self.form = new LOCA.OccupantForm();
        self.documentsForm = new LOCA.ContractDocumentsForm();
        // Call super constructor
        LOCA.ViewController.call(this, {
            domViewId: '#view-occupant',
            domListId: '#occupants',
            listSelectionMenuId: '#occupants-selection-menu',
            urls: {
                overview: '/api/occupants/overview',
                items: '/api/occupants'
            }
        });
    }
    // Inheritance stuff
    OccupantCtrl.prototype = Object.create(LOCA.ViewController);
    OccupantCtrl.prototype.constructor = OccupantCtrl;

    OccupantCtrl.prototype.initTemplates = function() {
        // Handlebars templates
        Handlebars.registerPartial('renthistory-template', $('#view-occupant #renthistory-template').html());
        this.templateHistoryRents = Handlebars.compile($('#view-occupant #rentshistory-template').html());

        var $occupantsSelected = $('#view-occupant #occupants-selected-template');
        if ($occupantsSelected.length >0) {
            self.templateSelectedRow = Handlebars.compile($occupantsSelected.html());
        }
    };

    OccupantCtrl.prototype.startUp = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.startUp.call(this, callback);
    };

    OccupantCtrl.prototype.pageExit = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.pageExit.call(this, callback);
    };

    OccupantCtrl.prototype.loadData = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.loadData.call(this, callback);
    };

    OccupantCtrl.prototype.loadList = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.loadList.call(this, callback);
    };

    OccupantCtrl.prototype.getSelectedIds = function() {
        // Call parent
        return LOCA.ViewController.prototype.getSelectedIds.call(this);
    };

    OccupantCtrl.prototype.scrollToVisible = function(selector) {
        // Call parent
        LOCA.ViewController.prototype.scrollToVisible.call(this, selector);
    };

    OccupantCtrl.prototype.openForm = function(id) {
        // Call parent
        LOCA.ViewController.prototype.openForm.call(this, id);
    };

    OccupantCtrl.prototype.closeForm = function(id) {
        // Call parent
        LOCA.ViewController.prototype.closeForm.call(this, id);
    };


    function loadPropertyList(callback) {
        LOCA.requester.ajax({
            type: 'GET',
            url: '/api/properties?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
        },
        function(properties) {
            if (callback) {
                callback(properties);
            }
        });
    }

    OccupantCtrl.prototype.onUserAction = function($action, actionId) {
        var selection = [];
        var selectionIds;

        selection = self.list.getSelectedData();

        if (actionId==='list-action-edit-occupant') {
            loadPropertyList(function(properties) {
                self.form.setData(selection[0], properties);
                self.openForm('occupant-form');
            });
        }
        else if (actionId==='list-action-add-occupant') {
            self.list.unselectAll();
            loadPropertyList(function(properties) {
                self.form.setData(null, properties);
                self.openForm('occupant-form');
            });
        }
        else if (actionId==='list-action-remove-occupant') {
            bootbox.confirm('Êtes-vous sûr de vouloir supprimer ce locataire ?', function(result) {
                if (!result) {
                    return;
                }
                selectionIds = [];
                for (var index=0; index < selection.length; ++index) {
                    selectionIds.push(selection[index]._id);
                }
                LOCA.requester.ajax({
                    type: 'POST',
                    url: '/occupants/remove',
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
        else if (actionId==='list-action-manage-documents') {
            self.documentsForm.setData(selection[0]);
            self.openForm('contract-documents-form');
        }
        else if (actionId==='list-action-save-contract-documents') {
            self.documentsForm.submit(function(data) {
                self.closeForm(function() {
                    if (data._id) {
                        LOCA.requester.ajax({
                            type: 'GET',
                            url: '/api/occupants/overview?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
                        },
                        function(occupantsOverview) {
                            var countAll = occupantsOverview.countAll;
                            var countActive = occupantsOverview.countActive;
                            var countInactive = occupantsOverview.countInactive;
                            $('#view-occupant .all-filter-label').html(countAll);
                            $('#view-occupant .all-active-filter-label').html(countActive);
                            $('#view-occupant .all-inactive-filter-label').html(countInactive);

                            self.list.update(data);
                            self.list.showAllRows(function () {
                                self.scrollToVisible();
                            });
                        });
                    }
                });
            });
        }
        else if (actionId==='list-action-rents-history') {
            $('#rents-history-table').html('');
            LOCA.requester.ajax({
                type: 'GET',
                url: '/api/rents/occupant?id='+selection[0]._id
            },
            function(rentsHistory) {
                $('#rents-history-table').html(self.templateHistoryRents(rentsHistory));
            });
            self.openForm('rents-history', true);
        }
        else if (actionId==='list-action-print') {
            self.openForm('print-doc-selector');
        }
    };

    OccupantCtrl.prototype.initListeners = function() {
        // Call parent
        LOCA.ViewController.prototype.initListeners.call(this);

        $(document).on('click', '#view-occupant #printofficechecklist', function() {
            //LOCA.application.openPrintPreview('/public/pdf/checklist.pdf');
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/checklist?occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printcontract', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/contract?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printcustomcontract', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/customcontract?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printdomcontract', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/domcontract?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printguarantycertificate', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/guarantycertificate?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printguarantypayback', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/guarantypaybackcertificate?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printguarantyrequest', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/guarantyrequest?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printinsurancerequest', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/insurance?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

    };

    OccupantCtrl.prototype.onLoadData = function(callback) {
        this.form.bindForm();
        this.documentsForm.bindForm();
        if (callback) {
            callback();
        }
    };

    return new OccupantCtrl();
})(window.$, window.Handlebars, window.bootbox);