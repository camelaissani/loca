import $ from 'jquery';

export default () => {
    $('#logoff').click(function() {
        window.location='/logout';
        return false;
    });
};
