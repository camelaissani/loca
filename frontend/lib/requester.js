import $ from 'jquery';
import i18next from 'i18next';

let requester;

class Requester {

    constructor() {
        this.responseFailListeners = [];
        this.afterListeners = [];
        this.beforeListeners = [];
    }

    responseFailListener(listener) {
        this.responseFailListeners.push(listener);
    }

    beforeListener(listener) {
        this.beforeListeners.push(listener);
    }

    afterListener(listener) {
        this.afterListeners.push(listener);
    }

    callListeners(listeners, data) {
        var listener;
        for (var j=0; j<listeners.length; j++) {
            listener = listeners[j];
            if (listener) {
                listener(data);
            }
        }
    }

    ajax(data, doneCallback, failCallback) {
        var that = this;

        this.callListeners(this.beforeListeners);

        $.ajax(data)
        .done( function(result/*, textStatus, jqXHR*/) {
            if (doneCallback) {
                doneCallback(result);
            }
            that.analyseResponse(result);
            that.callListeners(that.afterListeners);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            var result = {
                httpError : {
                    jqXHR : jqXHR,
                    textStatus : textStatus,
                    errorThrown : errorThrown
                }
            };
            if (failCallback) {
                failCallback(result);
            }
            that.analyseResponse(result);
            that.callListeners(that.afterListeners);
        });
    }

    analyseResponse(result) {
        var needAuthentication = false;
        if (result.httpError) {
            result.errors = result.errors?result.errors:[];
            if (result.httpError.jqXHR.status === 0) {
                result.errors.push(i18next('Server access problem. Check your network connection'));
            } else if (result.httpError.jqXHR.status == 401) {
                needAuthentication = true;
                result.errors.push(i18next.t('Your session has expired, Please reconnect'));
                result.errors.push(i18next.t('[code: ]', {code: 401}));
            } else if (result.httpError.jqXHR.status == 404) {
                result.errors.push(i18next.t('Page not found on server'));
                result.errors.push(i18next.t('[code: ]', {code: 404}));
            } else if (result.httpError.jqXHR.status == 500) {
                result.errors.push(i18next.t('Internal server error'));
                result.errors.push(i18next.t('[code: ]', {code: 500}));
            } else if (result.httpError.errorThrown === 'parsererror') {
                result.errors.push(i18next.t('Problem during data decoding [JSON]'));
            } else if (result.httpError.errorThrown === 'timeout') {
                result.errors.push(i18next.t('Server is taking too long to reply'));
            } else if (result.httpError.errorThrown === 'abort') {
                result.errors.push(i18next.t('Request cancelled on server'));
            } else {
                result.errors.push(i18next.t('Unknown error'));
                result.errors.push(result.httpError.jqXHR.responseText);
            }
        }
        if (result.errors && result.errors.length>0) {
            this.callListeners(this.responseFailListeners, result.errors);
        }
        if (needAuthentication) {
            setTimeout(function(){
                window.location.replace(location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')+'/login');
            }, 2000);
        }
    }
}

if (!requester) {
    requester = new Requester();
}

export default requester;
