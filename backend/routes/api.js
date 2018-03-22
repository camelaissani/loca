'use strict';

import express from 'express';
import loginManager from '../managers/loginmanager';
import rentManager from '../managers/rentmanager';
import occupantManager from '../managers/occupantmanager';
import documentManager from '../managers/documentmanager';
import propertyManager from '../managers/propertymanager';
import ownerManager from '../managers/ownermanager';
import notificationManager from '../managers/notificationmanager';
import accountingManager from '../managers/accountingmanager';
import emailManager from '../managers/emailmanager';

export default function() {
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
}
