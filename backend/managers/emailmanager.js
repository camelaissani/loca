const moment = require('moment');
const axios = require('axios');
const logger = require('winston');
const config = require('../../config');


const sendEmail = async message => {
    const postData = {
        'document': message.document,
        'id': message.tenantId,
        'term': message.term
    };

    try {
        const response = await axios.post(config.EMAILER_URL, postData);

        logger.info(`POST ${config.EMAILER_URL} ${response.status}`);
        logger.debug(`data sent: ${postData}`);
        logger.debug(`response: ${response.data}`);
        return response.data;
    } catch (error) {
        logger.error(`POST ${config.EMAILER_URL} failed`);
        logger.error(`data sent: ${postData}`);
        logger.error(error);
        if (config.demoMode) {
            logger.info('email status fallback workflow activated in demo mode');
            const result = { ...message };
            result.error = 'demo mode, mail cannot be sent';
            return [ result ];
        } else {
            throw error;
        }
    }
};

module.exports = {
    async send(req, res) {
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
        const status = await Promise.all(messages.map(message => sendEmail(message)));
        try {
            const results = status.reduce((acc, result) => {
                acc.push(...result);
                return acc;
            }, []);
            res.json(results);
        } catch(err) {
            logger.error(err);
            res.status(500).send(err);
        }
    }
};