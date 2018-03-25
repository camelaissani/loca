const moment = require('moment');
const http = require('http');
const logger = require('winston');
const config = require('../../config').default;

function sendEmail(messages) {
    return Promise.all(messages.map((message) => {
        return new Promise((resolve, reject) => {
            const req = http.request(`${config.EMAILER_URI}/${message.document}/${message.tenantId}/${message.term}`);
            req.on('error', err => {
                reject(err);
                logger.error(`GET ${config.EMAILER_URI}/${message.document}/${message.tenantId}/${message.term} failed`);
                logger.error(err);
            });
            req.on('response', (res) => {
                if (res.statusCode>299) {
                    logger.error(`GET ${config.EMAILER_URI}/${message.document}/${message.tenantId}/${message.term} ${res.statusCode}`);
                    if (res.body) {
                        logger.error(res.body);
                        reject(res.body);
                    } else {
                        const err = `${res.statusCode} ${res.statusMessage}`;
                        reject(err);
                    }
                    return;
                }
                let body = '';
                res.on('data', chunk => {
                    body += chunk;
                });
                res.on('end', () => {
                    logger.info(`GET ${config.EMAILER_URI}/${message.document}/${message.tenantId}/${message.term} ${res.statusCode}`);
                    logger.debug(body);
                    resolve(JSON.parse(body));
                });
            });
            req.end();
        });
    }));
}

export default {
    send(req, res) {
        const body = req.body;
        const document = body.document;
        const term = moment(`${body.year}/${body.month}/01`, 'YYYY/MM/DD').format('YYYYMMDDHH');
        const messages = req.body.tenantIds.map(tenantId => {
            return {
                document,
                tenantId,
                term
            };
        });
        sendEmail(messages)
        .then((resBody)=> res.status(200).json(resBody))
        .catch(err => {
            res.status(500).send(err);
            logger.error(err);
        });
    }
};