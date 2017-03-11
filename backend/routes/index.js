import express from 'express';
import rs from './requeststrategy';
import api from './api';
import auth from './auth';
import page from './page';


export default [
    () => express.Router().use('/api', rs.restrictedArea),
    auth,
    api,
    page
];
