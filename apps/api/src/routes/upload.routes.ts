import { Router, type Router as RouterType } from 'express';
import { uploadController } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { confirmUploadSchema, reorderPhotosSchema } from '../schemas/upload.schema.js';

export const uploadRouter: RouterType = Router();

uploadRouter.use(authenticate);
uploadRouter.get('/sign', uploadController.getSignedParams);
uploadRouter.post('/confirm', validate(confirmUploadSchema), uploadController.confirmUpload);
uploadRouter.delete('/:publicId', uploadController.deletePhoto);
uploadRouter.put('/reorder', validate(reorderPhotosSchema), uploadController.reorderPhotos);
