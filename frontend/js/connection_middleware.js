import i18next from 'i18next';
import frontexpress from 'frontexpress';
import bootbox from 'bootbox';

class ConnectionMiddleware extends frontexpress.Middleware {
    entered() {
        $('#waitwindow').show();
    }

    updated() {
        $('#waitwindow').hide();
    }

    exited() {
        $('#waitwindow').hide();
    }

    failed(request, response) {
        const errors = [];
        let needAuthentication = false;
        if (response.status === 0) {
            errors.push(i18next.t('Server access problem. Check your network connection'));
        } else if (response.status == 401) {
            needAuthentication = true;
            errors.push(i18next.t('Your session has expired, Please reconnect'));
            errors.push(i18next.t('[code: ]', {code: 401}));
        } else if (response.status == 404) {
            errors.push(i18next.t('Page not found on server'));
            errors.push(i18next.t('[code: ]', {code: 404}));
        } else if (response.status == 500) {
            errors.push(i18next.t('Internal server error'));
            errors.push(i18next.t('[code: ]', {code: 500}));
        } else if (response.errorThrown === 'parsererror') {
            errors.push(i18next.t('Problem during data decoding [JSON]'));
        } else if (response.errorThrown === 'timeout') {
            errors.push(i18next.t('Server is taking too long to reply'));
        } else if (response.errorThrown === 'abort') {
            errors.push(i18next.t('Request cancelled on server'));
        } else {
            errors.push(i18next.t('Unknown error'));
            errors.push(response.statusText);
        }

        bootbox.hideAll();
        $('#waitwindow').hide();
        bootbox.alert({title: i18next.t('Uh-oh!'), message: errors});

        if (needAuthentication) {
            setTimeout(function(){
                window.location.replace(location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')+'/signin');
            }, 2000);
        }
    }
}

export default ConnectionMiddleware;