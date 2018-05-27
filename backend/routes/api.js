'use strict';

const express = require('express');
const loginManager = require('../managers/loginmanager');
const rentManager = require('../managers/rentmanager');
const occupantManager = require('../managers/occupantmanager');
const documentManager = require('../managers/documentmanager');
const propertyManager = require('../managers/propertymanager');
const ownerManager = require('../managers/ownermanager');
const notificationManager = require('../managers/notificationmanager');
const accountingManager = require('../managers/accountingmanager');
const emailManager = require('../managers/emailmanager');

module.exports = function() {
    const router = express.Router();

    const realmsRouter = express.Router();
    realmsRouter.get('/:id', loginManager.selectRealm);
    router.use('/realms', realmsRouter);

    const occupantsRouter = express.Router();
    occupantsRouter.post('/', occupantManager.add);
    occupantsRouter.patch('/:id', occupantManager.update);
    occupantsRouter.delete('/:ids', occupantManager.remove);
    occupantsRouter.get('/', occupantManager.all);
    occupantsRouter.get('/overview', occupantManager.overview);
    router.use('/occupants', occupantsRouter);

    const documentsRouter = express.Router();
    documentsRouter.patch('/:id', documentManager.update);
    router.use('/documents', documentsRouter);

    const notificationsRouter = express.Router();
    notificationsRouter.get('/', notificationManager.all);
    router.use('/notifications', notificationsRouter);

    const rentsRouter = express.Router();
    rentsRouter.patch('/:id', rentManager.update);
    rentsRouter.get('/occupant/:id', rentManager.rentsOfOccupant);
    rentsRouter.get('/:year/:month', rentManager.all);
    rentsRouter.get('/overview', rentManager.overview);
    rentsRouter.get('/overview/:year/:month', rentManager.overview);
    router.use('/rents', rentsRouter);

    const propertiesRouter = express.Router();
    propertiesRouter.post('/', propertyManager.add);
    propertiesRouter.patch('/:id', propertyManager.update);
    propertiesRouter.delete('/:ids', propertyManager.remove);
    propertiesRouter.get('/', propertyManager.all);
    propertiesRouter.get('/overview', propertyManager.overview);
    router.use('/properties', propertiesRouter);

    router.get('/accounting/:year', accountingManager.all);

    const ownerRouter = express.Router();
    ownerRouter.get('/', ownerManager.all);
    ownerRouter.patch('/:id', ownerManager.update);
    router.use('/owner', ownerRouter);

    const emailRouter = express.Router();
    emailRouter.post('/', emailManager.send);
    router.use('/emails', emailRouter);

    const apiRouter = express.Router();
    apiRouter.use('/api', router);
    return apiRouter;
};
