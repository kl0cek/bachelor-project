import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import missionRoutes from './mission.routes';
import crewRoutes from './crew.routes';
import activityRoutes from './activity.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/missions', missionRoutes);
router.use('/crew', crewRoutes);
router.use('/activities', activityRoutes);

export default router;