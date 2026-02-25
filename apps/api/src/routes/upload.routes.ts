import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const uploadRouter = Router();

uploadRouter.use(authenticate);
uploadRouter.get('/sign', uploadController.getSignedParams);
uploadRouter.post('/confirm', uploadController.confirmUpload);
uploadRouter.delete('/:publicId', uploadController.deletePhoto);
uploadRouter.put('/reorder', uploadController.reorderPhotos);
