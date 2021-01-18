import $ from 'jquery';
import frontexpress from 'frontexpress';

const application = frontexpress();

const now = new Date();

application.set('LOCA', {
    currentMonth: now.getMonth() + 1,
    currentYear: now.getFullYear(),
    countryCode: 'en-US'
});

const httpPostPatchTransformer = {
    data({data}) {
        if (!data) {
            return data;
        }

        return $.param(data);
    },
    headers({headers, data}) {
        if (!data) {
            return headers;
        }
        const updatedHeaders = headers || {};
        if (!updatedHeaders['Content-Type']) {
            updatedHeaders['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
        return updatedHeaders;
    }
};

application.set('http POST transformer', httpPostPatchTransformer);
application.set('http PATCH transformer',httpPostPatchTransformer);

application.openPrintPreview = (url) => {
    window.open(url, '_blank', 'location=no,menubar=yes,status=no,titlebar=yes,toolbar=yes,scrollbars=yes,resizable=yes,width=1000,height=700');
};

application.sendEmail = (tenantIds, document, year, month, callback=()=>{}) => {
    if (!tenantIds) {
        callback();
    }
    application.httpPost({
        uri: '/api/emails',
        data: {
            document,
            tenantIds,
            year,
            month
        }
    }, (req, res) => {
        callback(JSON.parse(res.responseText));
    });
};

export default application;
