import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { confirmUploadSchema, reorderPhotosSchema } from '../schemas/upload.schema.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

export const uploadRouter: RouterType = Router();

// Public — HMAC token IS the auth for serving private photos
uploadRouter.get('/serve/:userId/:filename', uploadController.servePhoto);

uploadRouter.use(authenticate);
uploadRouter.get('/sign', uploadController.getSignedParams);
uploadRouter.post('/file', upload.single('photo'), uploadController.receiveFile);
uploadRouter.post('/confirm', validate(confirmUploadSchema), uploadController.confirmUpload);
uploadRouter.delete('/:publicId(*)', uploadController.deletePhoto);
uploadRouter.put('/reorder', validate(reorderPhotosSchema), uploadController.reorderPhotos);
