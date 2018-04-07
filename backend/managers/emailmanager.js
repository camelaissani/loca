const moment = require('moment');
const http = require('http');
const { URL } = require('url');
const logger = require('winston');
const config = require('../../config').default;

function sendEmail(messages) {
    return Promise.all(messages.map((message) => {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                'document': message.document,
                'id': message.tenantId,
                'term': message.term
            });
            const postUrl = new URL(config.EMAILER_URL);
            const postOption = {
                hostname: postUrl.hostname,
                port: postUrl.port,
                path: postUrl.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            const req = http.request(postOption);
            req.on('response', res => {
                res.setEncoding('utf8');
                let body = '';
                res.on('data', chunk => {
                    body += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode>299) {
                        logger.error(`POST ${config.EMAILER_URL} ${res.statusCode}`);
                        logger.error(`data sent: ${postData}`);
                        if (res.body) {
                            logger.error(`response: ${res.body}`);
                            reject(res.body);
                        } else {
                            const err = `${res.statusCode} ${res.statusMessage}`;
                            reject(err);
                        }
                        return;
                    }
                    logger.info(`POST ${config.EMAILER_URL} ${res.statusCode}`);
                    logger.debug(`data sent: ${postData}`);
                    logger.debug(`response: ${body}`);
                    resolve(JSON.parse(body));
                });
            });
            req.on('error', err => {
                reject(err);
                logger.error(`POST ${config.EMAILER_URL} failed`);
                logger.error(`data sent: ${postData}`);
                logger.error(err);
            });
            req.write(postData);
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
        .then(status => {
            const results = status.reduce((acc, result) => {
                acc.push(...result);
                return acc;
            }, []);
            res.status(200).json(results);
        })
        .catch(err => {
            res.status(500).send(err);
            logger.error(err);
        });
    }
};