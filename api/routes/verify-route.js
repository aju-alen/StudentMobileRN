import express from "express";
import { getAllSubjectsfalse } from "../controllers/verify-controller.js";
import { verifyToken } from "../middlewares/jwt.js";
const router = express.Router()


router.get('/',verifyToken, getAllSubjectsfalse);


export default router;