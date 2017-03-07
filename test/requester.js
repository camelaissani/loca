'use strict';

import express from 'express';
import request from 'supertest';



export default function(router, {httpMethod, uri}) {
    const app = express();
    app.use(router);

    return request(app)[httpMethod](uri);
}
