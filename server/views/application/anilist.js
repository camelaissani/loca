LOCA.List = (function($, Handlebars, Events){
    // -----------------------------------------------------------------------
    // PRIVATE ATTRIBUTES
    // -----------------------------------------------------------------------
    var EVENT_TYPE_SELECTION_CHANGED = 'list.selection.changed';
    var TRANSITION_ROW_DURATION = 100;
    var TRANSITION_ROW_STAGGER_DURATION = 50;
    var TRANSITION_MAXROW = 10;

    // -----------------------------------------------------------------------
    // CONSTRUCTOR
    // -----------------------------------------------------------------------
    function List(listId, rowTemplateId, contentTemplateId) {
        var self = this;

        // Use minivents
        Events(this);

        // attributes
        this.listId = listId.startsWith('#')?listId.slice(1, listId.length):listId;
        this.rowTemplateId = (rowTemplateId && rowTemplateId.startsWith('#'))?rowTemplateId.slice(1, rowTemplateId.length):rowTemplateId;
        this.contentTemplateId = (contentTemplateId && contentTemplateId.startsWith('#'))?contentTemplateId.slice(1, contentTemplateId.length):contentTemplateId;
        this.filterText = '';

        // row management
        $(document).on('click', '#' + this.listId + ' .list-row', function() {
            self.select($(this));
            return false;
        });
    }

    // -----------------------------------------------------------------------
    // PRIVATE METHODS
    // -----------------------------------------------------------------------
    // function _cloneObject(obj) {
    //     var clone = {};
    //     for(var i in obj) {
    //         if(typeof(obj[i])=='object' && obj[i] !== null) {
    //             clone[i] = _cloneObject(obj[i]);
    //         }
    //         else {
    //             clone[i] = obj[i];
    //         }
    //     }
    //     return clone;
    // }

    function _cloneObject(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null === obj || 'object' !== typeof obj) {
            return obj;
        }

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = _cloneObject(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = _cloneObject(obj[attr]);
            }
            return copy;
        }

        throw new Error('Unable to copy obj! Its type isn\'t supported.');
    }

    function _ref(obj, str) {
        str = str.split('.');
        for (var i = 0; i < str.length; i++) {
            obj = obj[str[i]];
        }
        return obj;
    }

    function _set(obj, str, val) {
        str = str.split('.');
        while (str.length > 1) {
            obj = obj[str.shift()];
        }
        obj[str.shift()] = val;
    }

    function _animateValue($element, start, end, duration) {
        var nbLoop = 20;
        var range = end - start;
        var current = start;
        var stepTime = duration / nbLoop;
        var increment = range / nbLoop;
        var timer;

        if (range === 0) {
            return;
        }
        timer = setInterval(function() {
            current += increment;
            if ((range>0 && current >= end) ||
                (range<0 && current <= end)) {
                // TODO: manage number format
                $element.html(LOCA.formatMoney(end, true));
                clearInterval(timer);
            }
            else {
                // TODO: manage number format
                $element.html(LOCA.formatMoney(current, true));
            }
        }, stepTime);
    }

    // -----------------------------------------------------------------------
    // PUBLIC METHODS
    // -----------------------------------------------------------------------
    List.prototype.bindDom = function() {
        this.$list = $('#'+this.listId);
        this.$rowsContainer = this.$list.find('.list-content');

        // Handlebars templates
        var rowTemplate = $('#' + this.rowTemplateId);
        if (rowTemplate.length >0) {
            this.sourceTemplateRow = rowTemplate.html();
            Handlebars.registerPartial(this.rowTemplateId, this.sourceTemplateRow);
            this.templateRowsContainer = Handlebars.compile($('#' + this.contentTemplateId).html());
        }
    };

    // -----------------------------------------------------------------------
    // ROW MANAGEMENT
    // -----------------------------------------------------------------------
    List.prototype.unselectAll = function() {
        this.$list.find('.list-row').removeClass('active');
        this.emit(EVENT_TYPE_SELECTION_CHANGED);
    };

    List.prototype.unselect = function(id) {
        var selection;
        $('#'+id).removeClass('active');
        selection = this.getSelectedData();
        this.emit(EVENT_TYPE_SELECTION_CHANGED, selection.length>0?selection:null);
    };

    List.prototype.select = function($selectedRow, dontUnselectIfSelected) {
        var $entireSelectedRows;
        if ($selectedRow.hasClass('fixed')) {
            return;
        }
        if (!dontUnselectIfSelected && $selectedRow.hasClass('active')) {
            $selectedRow.removeClass('active');
        }
        else {
            $selectedRow.addClass('active');
        }

        $entireSelectedRows = this.getSelection();
        if ($entireSelectedRows.length !== 0) {
            this.emit(EVENT_TYPE_SELECTION_CHANGED, this.getSelectedData());
        }
        else {
            this.emit(EVENT_TYPE_SELECTION_CHANGED);
        }
    };

    List.prototype.getSelection = function() {
        return this.$list.find('.list-row.active');
    };

    List.prototype.update = function(newDataRow) {
        var templateRow,
            $htmlRow,
            newDataRowWithoutOdometerValues = _cloneObject(newDataRow),
            oldDataRow,
            $oldRow,
            $newRow,
            dataRowIndex,
            active,
            fixed;

        // Find old data
        for (var i=0; i<this.dataRows.rows.length; ++i) {
            if (this.dataRows.rows[i]._id === newDataRow._id) {
                dataRowIndex = i;
                oldDataRow = this.dataRows.rows[i];
                break;
            }
        }

        $oldRow= this.$list.find('#'+newDataRow._id+'.list-row');
        $oldRow.find('.odometer').each(function() {
            var key = $(this).data('key');
            _set(newDataRowWithoutOdometerValues, key, _ref(oldDataRow, key));
        });

        templateRow = Handlebars.compile(this.sourceTemplateRow);
        $htmlRow = $(templateRow(newDataRowWithoutOdometerValues));

        active = $oldRow.hasClass('active');
        if (active) {
            $htmlRow.addClass('active');
        }
        fixed = $oldRow.hasClass('fixed');
        if (fixed) {
            $htmlRow.addClass('fixed');
        }

        $oldRow.replaceWith($htmlRow);

        $newRow = this.$list.find('#'+newDataRow._id+'.list-row');
        $newRow.find('[data-toggle=tooltip]').tooltip();
        // this.show($newRow);

        // Play odometers
        $newRow.find('.odometer').each(function() {
            var $odometer = $(this);
            var key = $odometer.data('key');
            _animateValue($odometer, _ref(oldDataRow, key), _ref(newDataRow, key), 1000);
        });

        // update data
        this.dataRows.rows[dataRowIndex] = newDataRow;
    };

    List.prototype.remove = function(dataRow, noAnimation) {
        var $rowToRemove = this.$list.find('#'+dataRow._id+'.list-row');

        // Find data in array and remove it
        for (var i=0; i<this.dataRows.rows.length; ++i) {
            if (this.dataRows.rows[i]._id === dataRow._id) {
                this.dataRows.rows.splice(i, 1);
                break;
            }
        }

        // Animate remove
        if (!noAnimation) {
            $rowToRemove.velocity('transition.swoopOut', {complete: function() {
                // Remove row from DOM
                $rowToRemove.remove();
            }});
        }
        else {
            $rowToRemove.remove();
        }
    };

    List.prototype.add = function(dataRow, noAnimation) {
        var templateRow = Handlebars.compile(this.sourceTemplateRow);
        var htmlRow = templateRow(dataRow);
        var $newRow;

        // Add data in array
        this.dataRows.rows.push(dataRow);

        // Add row in DOM
        this.$rowsContainer.append(htmlRow);
        $newRow = this.$list.find('#'+dataRow._id+'.list-row');

        // Animate add
        $newRow.find('[data-toggle=tooltip]').tooltip();
        if (!noAnimation) {
            $newRow.velocity('transition.swoopIn');
        }
        else {
            this.show($newRow);
        }
    };

    List.prototype.init = function(dataRows, noAnimation, callback) {
        var htmlRows, $htmlRows;

         // Add initial rows
        if (!dataRows) {
            this.dataRows = {rows:[]};
        }
        else {
            this.dataRows = dataRows;
        }
        if (this.templateRowsContainer) {
            htmlRows = this.templateRowsContainer(this.dataRows);
            $htmlRows = $(htmlRows).hide();
            this.$rowsContainer.html($htmlRows);

            // Tooltip management
            this.$rowsContainer.find('[data-toggle=tooltip]').tooltip();

            this.filter(this.filterText, false, callback);
        }
        else if (callback) {
            callback();
        }
    };

    List.prototype.setFilterText = function(text) {
        this.filterText = text;
    };

    List.prototype.filter = function(text, noAnimation, callback) {
        var that = this;
        var $allRows;
        var $rowsToFilter;
        var $rowsToShow;
        var $rowsToHide;
        var filterValues;
        var index;

        this.filterText = text;

        // remove filter on all rows
        $allRows = this.$list.find('.list-row');
        $allRows.removeClass('list-element-filtered');

        // hide rows that not match filter
        if (this.filterText) {
            filterValues = this.filterText.split(',');
            for (index = 0; index < filterValues.length; index++) {
                $rowsToFilter = $allRows.find('.list-value').filter(':contains("'+filterValues[index]+'")').closest('.list-row');
                $rowsToFilter.addClass('list-element-filtered');
            }

            if (!noAnimation) {
                $rowsToHide = $allRows.not('.list-element-filtered').not(':hidden');
                $rowsToShow = this.$list.find('.list-row.list-element-filtered:hidden');

                this.hideRows($rowsToHide, function() {
                    that.showRows($rowsToShow, callback);
                });
            }
            else {
                this.hide($allRows);
                this.show($rowsToFilter);
                if (callback) {
                    callback();
                }
            }
        }
        else {
            $rowsToShow = this.$list.find('.list-row:hidden');
            if (!noAnimation) {
                this.showRows($rowsToShow, callback);
            }
            else {
                this.show($rowsToShow);
                if (callback) {
                    callback();
                }
            }
        }
    };

    List.prototype.hide = function($rows) {
        $rows.hide();
    };

    List.prototype.show = function($rows) {
        var $rowsToShow = $rows;
        if (this.filterText) {
            $rowsToShow = $rows.find('.list-value').filter(':contains("'+this.filterText+'")').closest('.list-row:hidden');
        }
        $rowsToShow.show();
    };

    List.prototype.hideRows = function($rows, callback) {
        var $rowsWithTransition, $rowsWithoutTransition;

        if ($rows.length === 0) {
            if (callback) {
                callback();
            }
            return;
        }

        if ($rows.length > TRANSITION_MAXROW) {
            $rowsWithTransition = $rows.slice(0, TRANSITION_MAXROW);
            $rowsWithoutTransition = $rows.slice(TRANSITION_MAXROW, $rows.length);

            this.hide($rowsWithoutTransition);
            $rowsWithTransition.velocity('transition.bounceRightOut', {duration: TRANSITION_ROW_DURATION, stagger: TRANSITION_ROW_STAGGER_DURATION, complete: function(){
                if (callback) {
                    callback();
                }
            }});
        }
        else {
            $rows.velocity('transition.bounceRightOut', {duration: TRANSITION_ROW_DURATION, stagger: TRANSITION_ROW_STAGGER_DURATION, complete: function(){
                if (callback) {
                    callback();
                }
            }});
        }
    };

    List.prototype.showRows = function($rows, callback) {
        var $rowsWithTransition, $rowsWithoutTransition,
            self = this;

        if ($rows.length === 0) {
            if (callback) {
                callback();
            }
            return;
        }

        if ($rows.length > TRANSITION_MAXROW) {
            $rowsWithTransition = $rows.slice(0, TRANSITION_MAXROW);
            $rowsWithoutTransition = $rows.slice(TRANSITION_MAXROW, $rows.length);

            $rowsWithTransition.velocity('transition.bounceRightIn', {display: 'table', duration: TRANSITION_ROW_DURATION, stagger: TRANSITION_ROW_STAGGER_DURATION, complete: function(){
                self.show($rowsWithoutTransition);
                if (callback) {
                    callback();
                }
            }});
        }
        else {
            if ($rows.length>0) {
                $rows.velocity('transition.bounceRightIn', {display: 'table', duration: TRANSITION_ROW_DURATION, stagger: TRANSITION_ROW_STAGGER_DURATION, complete: function(){
                    if (callback) {
                        callback();
                    }
                }});
            }
            else {
                if (callback) {
                    callback();
                }
            }
        }
    };

    List.prototype.showAllRows = function(callback) {
        this.filter(this.filterText, false, callback);
    };

    List.prototype.hideAllRows = function(callback) {
        this.hideRows(this.$list.find('.list-row').not(':hidden'), callback);
    };

    // -----------------------------------------------------------------------
    // DATA ACCESS
    // -----------------------------------------------------------------------
    List.prototype.getSelectedData = function() {
        var self = this;
        var data = [];

        //TODO: to optimize
        this.getSelection().each(function() {
            var id = $(this).attr('id');
            for (var i = 0; i < self.dataRows.rows.length; i++) {
                if (self.dataRows.rows[i]._id === id) {
                    data.push(_cloneObject(self.dataRows.rows[i]));
                    break;
                }
            }
        });
        return data;
    };

    return List;
})(window.jQuery, window.Handlebars, window.Events);