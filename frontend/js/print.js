import $ from 'jquery';
import i18next from 'i18next';
import application from './application';
import language from './language';

const LOCA = application.get('LOCA');

language(LOCA.countryCode, (countryCode) => {
    LOCA.countryCode = countryCode;
    $('#printbutton').click(function() {
        let error = false;
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
});


