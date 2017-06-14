'use strict';
import path from 'path';
import express from 'express';
import request from 'supertest';


export default function(router, {httpMethod, uri}, viewEngineStub) {
    const app = express();

    if (viewEngineStub) {
        viewEngineStub.callsArgWith(2, '');
        app.engine('ejs', viewEngineStub);
        app.set('views', path.join(__dirname, '..', 'backend', 'views'));
        app.set('view engine', 'ejs');
    }
    app.use(router);

    return request(app)[httpMethod](uri);
}
