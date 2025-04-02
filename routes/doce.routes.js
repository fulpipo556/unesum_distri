import Router from 'express';
import multer from 'multer';
import { docentcontrollers }  from '../controllers/docent.controllers.js';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    }
});
router.get('/docent', docentcontrollers.getAllDoces)

router.get('/docent/:id', docentcontrollers.getDoces)

router.post('/docent', docentcontrollers.createDoces)

router.delete('/docent/:id', docentcontrollers.deleteDoces)

router.put('/docent/:id', docentcontrollers.updateDoces)
router.post('/docent/upload', upload.single('file'), docentcontrollers.uploadDoces);
export default router;