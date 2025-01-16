import express from "express";
const router = express.Router()
import { postProfileImageS3,subjectPDFVerifyeS3 } from '../controllers/s3-controller.js';
import multer from 'multer';
// Configure multer for file upload
const upload = multer();


router.post('/upload-to-aws/:userId', upload.single('image'), postProfileImageS3);

router.post('/upload-to-aws/pdf-verify/:userId', upload.fields([{ name: 'pdf1' }, { name: 'pdf2' }]), subjectPDFVerifyeS3);


export default router;