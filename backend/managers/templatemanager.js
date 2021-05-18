const config = require('../../config');
const axios = require('axios');

//TODO: if no added value to have the api in  loca then move that in nginx config

const pdfGeneratorUrl = `${config.PDFGENERATOR_URL}/templates`;

////////////////////////////////////////////////////////////////////////////////
// Exported functions
////////////////////////////////////////////////////////////////////////////////
const all = async (req, res) => {
  const { language } = req;

  const response = await axios.get(pdfGeneratorUrl, {
    headers: {
      organizationId: req.headers.organizationid,
      'Accept-Language': language,
    },
  });

  res.json(response.data);
};

const one = async (req, res) => {
  const { language } = req;
  const { id } = req.params;

  const response = await axios.get(`${pdfGeneratorUrl}/${id}`, {
    headers: {
      organizationId: req.headers.organizationid,
      'Accept-Language': language,
    },
  });

  res.json(response.data);
};

const add = async (req, res) => {
  const { language } = req;

  const response = await axios.post(pdfGeneratorUrl, req.body, {
    headers: {
      organizationId: req.headers.organizationid,
      'Accept-Language': language,
    },
  });

  res.json(response.data);
};

const update = async (req, res) => {
  const { language } = req;

  const response = await axios.put(pdfGeneratorUrl, req.body, {
    headers: {
      organizationId: req.headers.organizationid,
      'Accept-Language': language,
    },
  });

  res.json(response.data);
};

const remove = async (req, res) => {
  const { language } = req;
  const { id } = req.params;

  const response = await axios.delete(`${pdfGeneratorUrl}/${id}`, {
    headers: {
      organizationId: req.headers.organizationid,
      'Accept-Language': language,
    },
  });

  res.json(response.data);
};

module.exports = {
  all,
  one,
  add,
  update,
  remove,
};
