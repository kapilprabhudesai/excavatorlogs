
import express from "express";
import { addLog,getLogsReport,deleteLog } from "../controllers/logController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, addLog);
router.get("/excavator/:excavatorId", authMiddleware, getLogsReport);
router.delete("/:id", authMiddleware, deleteLog);



export default router;
