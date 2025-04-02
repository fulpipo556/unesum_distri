import Router from 'express';

import { districontrollers }  from '../controllers/distri.controllers.js';

const router = Router();

router.get('/distris', districontrollers.getAlldistris)

router.get('/distris/:id', districontrollers.getDistris)

router.post('/distris', districontrollers.createDistris)

router.delete('/distris/:id', districontrollers.deleteDistris)

router.put('/distris/:id', districontrollers.updateDistris)

export default router;