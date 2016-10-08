import $ from 'jquery';
import application from './application';

export default () => {
    $(document).on('click', '.nav-action', function() {
        var viewId = $(this).data('id');
        application.updateView(viewId, null, true);
    });
    $(document).on('click', '.navbar-collapse.collapse.in a:not(.dropdown-toggle)', function() {
        $(this).closest('.navbar-collapse').collapse('hide');
    });
    $(document).on('click', '.navbar-collapse.collapse.in button:not(.navbar-toggle)', function() {
        $(this).closest('.navbar-collapse').collapse('hide');
    });
};
