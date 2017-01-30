import $ from 'jquery';
import i18next from 'i18next';

export default {
    applicationReady(/*event*/) {
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
                window.alert(i18next.t('Fill the empty fields before printing the document'));
            }
            else {
                window.print();
            }
        });
    }
};

