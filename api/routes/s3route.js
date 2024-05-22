import express from "express";
const router = express.Router()
import { postProfileImageS3 } from '../controllers/s3-controller.js';
import AWS from 'aws-sdk';
import multer from 'multer';
  // Configure multer for file upload
  const upload = multer();


router.post('/upload-to-aws', upload.single('image'), postProfileImageS3);

export default router;