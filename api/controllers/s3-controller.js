import dotenv from "dotenv";
import { Upload } from '@aws-sdk/lib-storage';
import { S3 } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();

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

const CHAT_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
]);
const CHAT_AUDIO_MIME = new Set([
  'audio/m4a',
  'audio/mp4',
  'audio/aac',
  'audio/mpeg',
  'audio/x-m4a',
  'audio/wav',
  'audio/webm',
  'audio/x-caf',
  'audio/caf',
  'audio/3gpp',
  'video/mp4',
  'application/octet-stream',
]);

const chatExtFromMime = (mime, originalName = '', kind = 'image') => {
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/gif': 'gif',
    'audio/m4a': 'm4a',
    'audio/mp4': 'm4a',
    'audio/aac': 'aac',
    'audio/mpeg': 'mp3',
    'audio/x-m4a': 'm4a',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'audio/x-caf': 'caf',
    'audio/caf': 'caf',
    'audio/3gpp': '3gp',
    'video/mp4': 'm4a',
  };
  if (map[mime]) return map[mime];
  const fromName = path.extname(originalName).replace('.', '').toLowerCase();
  if (fromName) return fromName;
  return kind === 'audio' ? 'm4a' : 'jpg';
};

const normalizeChatMime = (file, kind) => {
  const mime = String(file.mimetype || '').toLowerCase();
  if (kind === 'audio') {
    if (CHAT_AUDIO_MIME.has(mime) && mime !== 'application/octet-stream') return mime;
    return 'audio/mp4';
  }
  if (CHAT_IMAGE_MIME.has(mime)) return mime;
  return 'image/jpeg';
};

export const postChatMediaS3 = async (req, res, next) => {
  const userId = req.userId;
  const file = req.file;
  const conversationId = String(req.body?.conversationId || '');
  const messageId = String(req.body?.messageId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const kind = req.body?.kind === 'audio' ? 'audio' : 'image';

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  if (!conversationId || !messageId) {
    return res.status(400).json({ error: 'conversationId and messageId are required' });
  }

  const contentType = normalizeChatMime(file, kind);
  const ext = chatExtFromMime(contentType, file.originalname, kind);

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        student: { select: { userId: true } },
        teacher: { select: { userId: true } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant =
      conversation.student?.userId === userId || conversation.teacher?.userId === userId;
    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not allowed to upload to this conversation' });
    }

    const key = `users/${userId}/chat/${conversationId}/${messageId}.${ext}`;
    const data = await new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: contentType,
      },
    }).done();

    const url =
      data.Location ||
      `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({
      url,
      key,
      mime: contentType,
      size: file.size,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

