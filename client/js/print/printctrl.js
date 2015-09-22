(function($) {
    $('#printbutton').click(function() {
        var error = false;
        $('[contenteditable]').each(function() {
            if ($(this).html().replace(/&nbsp;/g, '').replace(' ', '').length === 0) {
                $(this).addClass('error');
                error = true;
            }
            else {
                $(this).removeClass('error');
            }
        });
        if (error) {
            window.alert('Remplir les champs vides avant l\'impression du document');
        }
        else {
            window.print();
        }
    });
})(window.$);