import dotenv from "dotenv";
import { Upload } from '@aws-sdk/lib-storage';
import { S3 } from '@aws-sdk/client-s3';

dotenv.config();

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  },
});

export const postProfileImageS3 = async (req, res, next) => {
  const { uploadKey, awsId } = req.body;
  const userId = req.userId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const fileContent = file.buffer;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key:
        uploadKey === 'userProfileImageId'
          ? `users/${userId}/profileImage/${file.originalname}`
          : uploadKey === 'subjectImageId'
            ? `users/${userId}/subject/${awsId}/${file.originalname}`
            : '',
      Body: fileContent,
      ContentType: file.mimetype,
    };

    if (!params.Key) {
      return res.status(400).json({ error: 'Invalid upload key' });
    }

    const data = await new Upload({
      client: s3,
      params,
    }).done();

    res.status(200).json({ message: 'File uploaded successfully', data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const subjectPDFVerifyeS3 = async (req, res, next) => {
  const { awsId } = req.body;
  const userId = req.userId;
  const files = req.files;

  if (!files?.pdf1?.[0] || !files?.pdf2?.[0]) {
    return res.status(400).json({ error: 'Both PDF files are required' });
  }

  try {
    const fileContent1 = files.pdf1[0].buffer;
    const fileContent2 = files.pdf2[0].buffer;

    const params1 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `users/${userId}/subject/${awsId}/pdf1/${files.pdf1[0].originalname}`,
      Body: fileContent1,
      ContentType: files.pdf1[0].mimetype,
    };

    const params2 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `users/${userId}/subject/${awsId}/pdf2/${files.pdf2[0].originalname}`,
      Body: fileContent2,
      ContentType: files.pdf2[0].mimetype,
    };

    const data1 = await new Upload({
      client: s3,
      params: params1,
    }).done();
    const data2 = await new Upload({
      client: s3,
      params: params2,
    }).done();

    res.status(200).json({ message: 'File uploaded successfully', data1, data2 });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const organizationTradeLicenseS3 = async (req, res, next) => {
  const userId = req.userId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const fileContent = file.buffer;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `users/${userId}/organization/${file.originalname}`,
      Body: fileContent,
      ContentType: file.mimetype,
    };

    const data = await new Upload({
      client: s3,
      params,
    }).done();

    res.status(200).json({
      message: 'Trade license uploaded successfully',
      data,
      location: data.Location,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
