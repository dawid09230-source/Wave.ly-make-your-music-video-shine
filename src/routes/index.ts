import { Router, type IRouter } from "express";
import healthRouter from "./health";
import videosRouter from "./videos";
import usersRouter from "./users";
import commentsRouter from "./comments";
import authRouter from "./auth";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(videosRouter);
router.use(usersRouter);
router.use(commentsRouter);
router.use(notificationsRouter);

export default router;
