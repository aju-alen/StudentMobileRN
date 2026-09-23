import express from "express";
const router = express.Router();
import { postProfileImageS3, subjectPDFVerifyeS3, organizationTradeLicenseS3, postChatMediaS3 } from '../controllers/s3-controller.js';
import multer from 'multer';
import { verifyToken } from '../middlewares/jwt.js';

const IMAGE_MIME = /^image\/(jpeg|jpg|png|webp|gif)$/;
const PDF_MIME = 'application/pdf';

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_MIME.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed'));
  },
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === PDF_MIME) return cb(null, true);
    cb(new Error('Only PDF files are allowed'));
  },
});

const chatMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const kind = req.body?.kind === 'audio' ? 'audio' : 'image';
    const mime = String(file.mimetype || '').toLowerCase();
    const name = String(file.originalname || '').toLowerCase();
    const imageOk =
      mime.startsWith('image/') ||
      mime === 'application/octet-stream' ||
      /\.(jpe?g|png|webp|heic|heif|gif)$/.test(name);
    const audioOk =
      mime.startsWith('audio/') ||
      mime === 'video/mp4' ||
      mime === 'application/octet-stream' ||
      /\.(m4a|aac|mp3|wav|caf|3gp|mp4|webm)$/.test(name);
    if ((kind === 'audio' && audioOk) || (kind === 'image' && imageOk)) {
      return cb(null, true);
    }
    cb(new Error('Only images or voice notes are allowed'));
  },
});

router.post('/upload-to-aws', verifyToken, imageUpload.single('image'), postProfileImageS3);

router.post(
  '/upload-to-aws/pdf-verify',
  verifyToken,
  pdfUpload.fields([{ name: 'pdf1' }, { name: 'pdf2' }]),
  subjectPDFVerifyeS3
);

router.post(
  '/upload-to-aws/organization-trade-license',
  verifyToken,
  pdfUpload.single('tradeLicense'),
  organizationTradeLicenseS3
);

router.post(
  '/chat-media',
  verifyToken,
  (req, res, next) => {
    chatMediaUpload.single('media')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || 'Invalid media file' });
      next();
    });
  },
  postChatMediaS3
);

export default router;
