import $ from 'jquery';
import Handlebars from 'handlebars';
import Events from 'minivents';
import Helper from './helper';

const EVENT_TYPE_SELECTION_CHANGED = 'list.selection.changed';

class Anilist{
    // -----------------------------------------------------------------------
    // PRIVATE ATTRIBUTES
    // -----------------------------------------------------------------------
    // var TRANSITION_ROW_DURATION = 100;
    // var TRANSITION_ROW_STAGGER_DURATION = 50;
    // var TRANSITION_MAXROW = 10;

    // -----------------------------------------------------------------------
    // CONSTRUCTOR
    // -----------------------------------------------------------------------
    constructor(listId, rowTemplateId, contentTemplateId) {
        var self = this;

        // Use minivents
        Events(this);

        // attributes
        this.listId = listId.startsWith('#')?listId.slice(1, listId.length):listId;
        this.rowTemplateId = (rowTemplateId && rowTemplateId.startsWith('#'))?rowTemplateId.slice(1, rowTemplateId.length):rowTemplateId;
        this.contentTemplateId = (contentTemplateId && contentTemplateId.startsWith('#'))?contentTemplateId.slice(1, contentTemplateId.length):contentTemplateId;
        this.filterText = '';

        // row management
        $(document).on('click', '#' + this.listId + ' .js-list-row', function() {
            self.select($(this));
            return false;
        });
    }

    // -----------------------------------------------------------------------
    // PRIVATE METHODS
    // -----------------------------------------------------------------------
    _cloneObject(obj) {
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
                copy[i] = this._cloneObject(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this._cloneObject(obj[attr]);
            }
            return copy;
        }

        throw new Error('Unable to copy obj! Its type isn\'t supported.');
    }

    _ref(obj, str) {
        str = str.split('.');
        for (var i = 0; i < str.length; i++) {
            obj = obj[str[i]];
        }
        return obj;
    }

    _set(obj, str, val) {
        str = str.split('.');
        while (str.length > 1) {
            obj = obj[str.shift()];
        }
        obj[str.shift()] = val;
    }

    _animateValue($element, start, end, duration) {
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
                $element.html(Helper.formatMoney(end));
                clearInterval(timer);
            }
            else {
                // TODO: manage number format
                $element.html(Helper.formatMoney(current));
            }
        }, stepTime);
    }

    // -----------------------------------------------------------------------
    // PUBLIC METHODS
    // -----------------------------------------------------------------------
    bindDom() {
        this.$list = $('#'+this.listId);
        this.$rowsContainer = this.$list.find('.js-list-content');

        // Handlebars templates
        var rowTemplate = $('#' + this.rowTemplateId);
        if (rowTemplate.length >0) {
            this.sourceTemplateRow = rowTemplate.html();
            Handlebars.registerPartial(this.rowTemplateId, this.sourceTemplateRow);
            this.templateRowsContainer = Handlebars.compile($('#' + this.contentTemplateId).html());
        }
    }

    // -----------------------------------------------------------------------
    // ROW MANAGEMENT
    // -----------------------------------------------------------------------
    unselectAll() {
        this.$list.find('.js-list-row').removeClass('active');
        this.emit(EVENT_TYPE_SELECTION_CHANGED);
    }

    unselect(id) {
        var selection;
        $('#'+id).removeClass('active');
        selection = this.getSelectedData();
        this.emit(EVENT_TYPE_SELECTION_CHANGED, selection.length>0?selection:null);
    }

    select($selectedRow, dontUnselectIfSelected) {
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
    }

    getSelection() {
        return this.$list.find('.js-list-row.active');
    }

    update(newDataRow) {
        var self = this,
            templateRow,
            $htmlRow,
            newDataRowWithoutOdometerValues = this._cloneObject(newDataRow),
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

        $oldRow= this.$list.find('#'+newDataRow._id+'.js-list-row');
        $oldRow.find('.odometer').each(function() {
            var key = $(this).data('key');
            self._set(newDataRowWithoutOdometerValues, key, self._ref(oldDataRow, key));
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

        $newRow = this.$list.find('#'+newDataRow._id+'.js-list-row');
        $newRow.find('[data-toggle=tooltip]').tooltip();
        // this.show($newRow);

        // Play odometers
        $newRow.find('.odometer').each(function() {
            var $odometer = $(this);
            var key = $odometer.data('key');
            self._animateValue($odometer, self._ref(oldDataRow, key), self._ref(newDataRow, key), 1000);
        });

        // update data
        this.dataRows.rows[dataRowIndex] = newDataRow;
    }

    remove(dataRow/*, noAnimation*/) {
        var $rowToRemove = this.$list.find('#'+dataRow._id+'.js-list-row');

        // Find data in array and remove it
        for (var i=0; i<this.dataRows.rows.length; ++i) {
            if (this.dataRows.rows[i]._id === dataRow._id) {
                this.dataRows.rows.splice(i, 1);
                break;
            }
        }

        // Animate remove
        // if (!noAnimation) {
        //     $rowToRemove.velocity('transition.swoopOut', {complete: function() {
        //         // Remove row from DOM
        //         $rowToRemove.remove();
        //     }});
        // }
        // else {
        $rowToRemove.remove();
        // }
    }

    add(dataRow/*, noAnimation*/) {
        var templateRow = Handlebars.compile(this.sourceTemplateRow);
        var htmlRow = templateRow(dataRow);
        var $newRow;

        // Add data in array
        this.dataRows.rows.push(dataRow);

        // Add row in DOM
        this.$rowsContainer.append(htmlRow);
        $newRow = this.$list.find('#'+dataRow._id+'.js-list-row');

        // Animate add
        $newRow.find('[data-toggle=tooltip]').tooltip();
        // if (!noAnimation) {
        //     $newRow.velocity('transition.swoopIn');
        // }
        // else {
        this.show($newRow);
        // }
    }

    init(dataRows, noAnimation, callback) {
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
    }

    setFilterText(text) {
        this.filterText = text;
    }

    filter(text, noAnimation, callback) {
        // var that = this;
        let $rowsToShow;

        this.filterText = text;

        // remove filter on all rows
        const $allRows = this.$list.find('.js-list-row');
        $allRows.removeClass('list-element-filtered');

        // hide rows that not match filter
        if (this.filterText) {
            const filterValues = this.filterText.split(',');
            $allRows.each(function() {
                const $row = $(this);
                const rowFilterValues = $row.data('filter-values').split(',');
                if (rowFilterValues.some(value => filterValues.indexOf(value) !== -1)) {
                    $row.addClass('list-element-filtered');
                }
            });

            const $rowsToHide = $allRows.not('.list-element-filtered').not(':hidden');
            $rowsToShow = this.$list.find('.js-list-row.list-element-filtered:hidden');

            $rowsToHide.hide();
            $rowsToShow.show();
            if (callback) {
                callback();
            }
        }
        else {
            $rowsToShow = this.$list.find('.js-list-row:hidden');
            $rowsToShow.show();
            if (callback) {
                callback();
            }
        }
    }

    hide($rows) {
        $rows.hide();
    }

    show($rows) {
        var $rowsToShow = $rows;
        if (this.filterText) {
            $rowsToShow = $rows.find('.js-list-value').filter(':contains("'+this.filterText+'")').closest('.js-list-row:hidden');
        }
        $rowsToShow.show();
    }

    hideRows($rows, callback) {
        // var $rowsWithTransition, $rowsWithoutTransition;

        if ($rows.length === 0) {
            if (callback) {
                callback();
            }
            return;
        }

        // if ($rows.length > TRANSITION_MAXROW) {
        //     $rowsWithTransition = $rows.slice(0, TRANSITION_MAXROW);
        //     $rowsWithoutTransition = $rows.slice(TRANSITION_MAXROW, $rows.length);

        //     this.hide($rowsWithoutTransition);
        //     $rowsWithTransition.velocity('transition.bounceRightOut', {duration: TRANSITION_ROW_DURATION, stagger: TRANSITION_ROW_STAGGER_DURATION, complete: function(){
        //         if (callback) {
        //             callback();
        //         }
        //     }});
        // }
        // else {
        //     $rows.velocity('transition.bounceRightOut', {duration: TRANSITION_ROW_DURATION, stagger: TRANSITION_ROW_STAGGER_DURATION, complete: function(){
        //         if (callback) {
        //             callback();
        //         }
        //     }});
        // }
        $rows.hide();
        if (callback) {
            callback();
        }
    }

    showRows($rows, callback) {
        // var $rowsWithTransition, $rowsWithoutTransition,
        //     self = this;

        if ($rows.length === 0) {
            if (callback) {
                callback();
            }
            return;
        }

        // if ($rows.length > TRANSITION_MAXROW) {
        //     $rowsWithTransition = $rows.slice(0, TRANSITION_MAXROW);
        //     $rowsWithoutTransition = $rows.slice(TRANSITION_MAXROW, $rows.length);

        //     $rowsWithTransition.velocity('transition.bounceRightIn', {display: 'table', duration: TRANSITION_ROW_DURATION, stagger: TRANSITION_ROW_STAGGER_DURATION, complete: function(){
        //         self.show($rowsWithoutTransition);
        //         if (callback) {
        //             callback();
        //         }
        //     }});
        // }
        // else {
        //     if ($rows.length>0) {
        //         $rows.velocity('transition.bounceRightIn', {display: 'table', duration: TRANSITION_ROW_DURATION, stagger: TRANSITION_ROW_STAGGER_DURATION, complete: function(){
        //             if (callback) {
        //                 callback();
        //             }
        //         }});
        //     }
        //     else {
        //         if (callback) {
        //             callback();
        //         }
        //     }
        // }
        $rows.show();
        if (callback) {
            callback();
        }
    }

    showAllRows(callback) {
        this.filter(this.filterText, false, callback);
    }

    hideAllRows(callback) {
        this.hideRows(this.$list.find('.js-list-row').not(':hidden'), callback);
    }

    // -----------------------------------------------------------------------
    // DATA ACCESS
    // -----------------------------------------------------------------------
    getSelectedData() {
        var self = this;
        var data = [];

        //TODO: to optimize
        this.getSelection().each(function() {
            var id = $(this).attr('id');
            for (var i = 0; i < self.dataRows.rows.length; i++) {
                if (self.dataRows.rows[i]._id === id) {
                    data.push(self._cloneObject(self.dataRows.rows[i]));
                    break;
                }
            }
        });
        return data;
    }
}

export default Anilist;
