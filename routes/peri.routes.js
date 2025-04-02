import Router from 'express';

import { pericontrollers }  from '../controllers/peri.controllers.js';

const router = Router();

router.get('/perio', pericontrollers.getAllPeri)

router.get('/perio/:id', pericontrollers.getPeris)

router.post('/perio', pericontrollers.createPeri)

router.delete('/perio/:id', pericontrollers.deletePeri)

router.put('/perio/:id', pericontrollers.updatePeri)

export default router;