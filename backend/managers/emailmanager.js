const { promisify } = require('util');
const moment = require('moment');
const axios = require('axios');
const logger = require('winston');
const config = require('../../config');
const occupantModel = require('../models/occupant');

const _sendEmail = async (locale, message) => {
    const postData = {
        templateName: message.document,
        recordId: message.tenantId,
        params: {
            term: message.term
        }
    };

    try {
        const response = await axios.post(config.EMAILER_URL, postData, {
            headers: {
                'Accept-Language': locale
            }
        });

        logger.info(`POST ${config.EMAILER_URL} ${response.status}`);
        logger.debug(`data sent: ${JSON.stringify(postData)}`);
        logger.debug(`response: ${JSON.stringify(response.data)}`);

        return response.data.map(({ templateName, recordId, params, email, status, error }) => ({
            document: templateName,
            tenantId: recordId,
            term: params.term,
            email,
            status
        }));
    } catch (error) {
        logger.error(`POST ${config.EMAILER_URL} failed`);
        logger.error(`data sent: ${JSON.stringify(postData)}`);
        logger.error((error.response && error.response.data && error.response.data.message) || error.message);
        throw error;
    }
};

module.exports = {
    send: async (req, res) => {
        try {
            const realm = req.realm;
            const { document, tenantIds, terms, year, month } = req.body;
            const findTenant = promisify(occupantModel.findOne).bind(occupantModel);
            const messages = [];
            await Promise.all(tenantIds.map(async (tenantId, index) => {
                const tenant = await findTenant(realm, tenantId);
                messages.push({
                    name: tenant.name,
                    tenantId,
                    document,
                    term: Number(terms && terms[index] || moment(`${year}/${month}/01`, 'YYYY/MM/DD').format('YYYYMMDDHH'))
                });
            }));
            const statusList = await Promise.all(messages.map(async message => {
                try {
                    return await _sendEmail(req.language, message);
                } catch (error) {
                    return [{
                        ...message,
                        error: (error.response && error.response.data) || { status: 500, message: 'Something went wrong'}
                    }];
                }
            }));
            const results = statusList.reduce((acc, statuses, index) => {
                acc.push(...statuses.map(status => ({ name: messages[index].name, ...status })));
                return acc;
            }, []);
            res.json(results);
        } catch (err) {
            logger.error(err);
            res.status(500).send(err);
        }
    }
};