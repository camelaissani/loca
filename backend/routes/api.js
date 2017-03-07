'use strict';

import express from 'express';
import rs from './requeststrategy';
import loginManager from '../managers/loginmanager';
import rentManager from '../managers/rentmanager';
import occupantManager from '../managers/occupantmanager';
import documentManager from '../managers/documentmanager';
import propertyManager from '../managers/propertymanager';
import ownerManager from '../managers/ownermanager';
import notificationManager from '../managers/notificationmanager';
import accountingManager from '../managers/accountingmanager';
import printManager from '../managers/printmanager';

export default function() {
    const router = express.Router();

    const realmsRouter = express.Router();
    realmsRouter.use(rs.restrictedArea);
    realmsRouter.route('/:id').get(loginManager.selectRealm);
    router.use('/realms', realmsRouter);

    const occupantsRouter = express.Router();
    occupantsRouter.use(rs.restrictedArea);
    occupantsRouter.route('/add').put(occupantManager.add);
    occupantsRouter.route('/update').post(occupantManager.update);
    occupantsRouter.route('/remove/:ids').get(occupantManager.remove);
    occupantsRouter.route('/').get(occupantManager.all);
    occupantsRouter.route('/overview').get(occupantManager.overview);
    router.use('/occupants', occupantsRouter);

    const documentsRouter = express.Router();
    documentsRouter.use(rs.restrictedArea);
    documentsRouter.route('/update').post(documentManager.update);
    documentsRouter.route('/print/:id/occupants/:ids/:year?/:month?').get(printManager.print);
    router.use('/documents', documentsRouter);

    const notificationsRouter = express.Router();
    notificationsRouter.use(rs.restrictedArea);
    notificationsRouter.route('/').get(notificationManager.all);
    router.use('/notifications', notificationsRouter);

    const rentsRouter = express.Router();
    rentsRouter.use(rs.restrictedArea);
    rentsRouter.route('/update').post(rentManager.update);
    rentsRouter.route('/occupant/:id').get(rentManager.rentsOfOccupant);
    rentsRouter.route('/:year/:month').get(rentManager.all);
    rentsRouter.route('/overview').get(rentManager.overview);
    rentsRouter.route('/overview/:year/:month').get(rentManager.overview);
    router.use('/rents', rentsRouter);

    const propertiesRouter = express.Router();
    propertiesRouter.use(rs.restrictedArea);
    propertiesRouter.route('/add').put(propertyManager.add);
    propertiesRouter.route('/update').post(propertyManager.update);
    propertiesRouter.route('/remove/:ids').get(propertyManager.remove);
    propertiesRouter.route('/').get(propertyManager.all);
    propertiesRouter.route('/overview').get(propertyManager.overview);
    router.use('/properties', propertiesRouter);

    router.route('/accounting/:year').get(rs.restrictedArea, accountingManager.all);

    const ownerRouter = express.Router();
    ownerRouter.use(rs.restrictedArea);
    ownerRouter.route('/').get(ownerManager.all);
    ownerRouter.route('/update').post(ownerManager.update);
    router.use('/owner', ownerRouter);

    const apiRouter = express.Router();
    apiRouter.use('/api', router);
    return apiRouter;
}
