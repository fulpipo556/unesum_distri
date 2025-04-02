import Router from 'express';

import { acticontrollers }  from '../controllers/acti.controllers.js';

const router = Router();



router.get('/acti/:id', acticontrollers.getActivi)

router.get('/acti', acticontrollers.getAllActivi)

router.post('/acti', acticontrollers.createActivi)

router.delete('/acti/:id', acticontrollers.deleteActivi)
// Add new route for delete all
router.delete('/acti-delete-all', acticontrollers.deleteAllActivi); // Changed path
router.put('/acti/:id', acticontrollers.updateActivi)
router.post('/acti/import', acticontrollers.importExcel);
export default router;