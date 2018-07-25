const moment = require('moment');
const http = require('http');
const { URL } = require('url');
const logger = require('winston');
const config = require('../../config');

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
                            return;
                        }
                        if (config.demomode) {
                            logger.info('email status fallback workflow activated in demo mode');
                            const result = Object.assign({}, message);
                            result.error = 'demo mode, emails cannot be sent';
                            resolve([result]);
                        } else {
                            reject(`${res.statusCode} ${res.statusMessage}`);
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
                logger.error(`POST ${config.EMAILER_URL} failed`);
                logger.error(`data sent: ${postData}`);
                logger.error(err);
                if (config.demomode) {
                    logger.info('email status fallback workflow activated in demo mode');
                    const result = Object.assign({}, message);
                    result.error = 'demo mode, mail cannot be sent';
                    resolve([result]);
                } else {
                    reject(err);
                }
            });
            req.write(postData);
            req.end();
        });
    }));
}

module.exports = {
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