'use strict';
var LOCA = {};
LOCA.routes = {};

(function($) {
    var $demoPopover = $('#demo-popover');
    $(document).on('click', '.navbar-collapse.collapse.in a:not(.dropdown-toggle)', function() {
        $(this).closest('.navbar-collapse').collapse('hide');
    });
    $(document).on('click', '.navbar-collapse.collapse.in button:not(.navbar-toggle)', function() {
        $(this).closest('.navbar-collapse').collapse('hide');
    });
    $demoPopover.popover({animation: true, placement: 'left'});
    $demoPopover.popover('toggle');
})(window.$);