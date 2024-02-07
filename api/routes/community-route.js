import express from "express";
import { createCommunity,getAllCommunity,updateSingleCommunity,getOneCommunity} from '../controllers/community-controller.js';
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()

router.get('/',verifyToken,getAllCommunity);
router.get('/:communityId',verifyToken,getOneCommunity);
router.post('/',verifyToken,createCommunity);
router.post('/:communityId',verifyToken,updateSingleCommunity);

export default router;