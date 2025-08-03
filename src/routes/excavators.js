
import express from "express";
import { addExcavator, getExcavators ,deleteExcavator} from "../controllers/excavatorController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, addExcavator);
router.get("/", authMiddleware, getExcavators);
router.delete("/:id", authMiddleware, deleteExcavator);

export default router;
