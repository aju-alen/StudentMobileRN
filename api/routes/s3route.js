import express from "express";
const router = express.Router();
import { postProfileImageS3, subjectPDFVerifyeS3, organizationTradeLicenseS3 } from '../controllers/s3-controller.js';
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

export default router;
