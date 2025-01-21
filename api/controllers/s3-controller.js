import dotenv from "dotenv";
import multer from 'multer';
import { Upload } from '@aws-sdk/lib-storage';
import { S3 } from '@aws-sdk/client-s3';
import fs from 'fs';

dotenv.config();

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  },

});
export const postProfileImageS3 = async (req, res,next) => {
  console.log(req.body.uploadKey,'this is body req');
  const {uploadKey,awsId} = req.body;
  
   const userId = req.params.userId;
    const file = req.file;
    // const filePath = path.join(__dirname, file.path);
  
    try {
        const fileContent = file.buffer;  
      // Set up S3 upload parameters
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uploadKey === 'userProfileImageId'? `users/${userId}/profileImage/${file.originalname}` : uploadKey === 'subjectImageId'? `users/${userId}/subject/${awsId}/${file.originalname}`:'' , // File name you want to save as in S3
        Body: fileContent,
        ContentType: file.mimetype,
      };
  
      // Uploading files to the bucket
      const data = await new Upload({
        client: s3,
        params,
      }).done();
  
      // Delete file from server after upload
  
      console.log(`File uploaded successfully. ${data.Location}`);
      res.status(200).json({ message: 'File uploaded successfully', data });
    } catch (err) {
      console.error(err);
      // Delete file from server if there's an error
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Error uploading file' });
    }
  };

export const subjectPDFVerifyeS3 = async (req, res) => {
  const {awsId} = req.body;
  const {userId} = req.params;
  const files = req.files;
  console.log(files,'this is files');
  try {
    const fileContent1 = files.pdf1[0].buffer;
    const fileContent2 = files.pdf2[0].buffer;      

    // Set up S3 upload parameters
    const params1 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `users/${userId}/subject/${awsId}/pdf1/${files.pdf1[0].originalname}`, // File name you want to save as in S3
      Body: fileContent1,
      ContentType: files.pdf1[0].mimetype,
    };

      console.log(params1,'this is params1');
      
    const params2 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `users/${userId}/subject/${awsId}/pdf2/${files.pdf2[0].originalname}`, // File name you want to save as in S3
      Body: fileContent2,
      ContentType: files.pdf2[0].mimetype,
    };

    // Uploading files to the bucket
    const data1 = await new Upload({
      client: s3,
      params: params1,
    }).done();
    const data2 = await new Upload({
      client: s3,
      params: params2,
    }).done();

    console.log(`File uploaded successfully. ${data1.Location}`);
    console.log(`File uploaded successfully. ${data2.Location}`);
    res.status(200).json({ message: 'File uploaded successfully', data1, data2 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error uploading file' });
  }
}

