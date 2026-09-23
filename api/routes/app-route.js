import express from 'express';

const router = express.Router();

router.get('/version', (_req, res) => {
  const version = String(process.env.APP_LATEST_VERSION || '1.2.0').trim();
  return res.status(200).json({ version });
});

export default router;
