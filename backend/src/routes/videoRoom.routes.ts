import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { videoRoomController } from '../controllers/videoRoom.controller';

const router = Router();

router.use(authenticate);

router.post('/', videoRoomController.createRoom.bind(videoRoomController));

router.get('/mission/:missionId', videoRoomController.getOrCreateRoom.bind(videoRoomController));

router.get('/:roomId', videoRoomController.getRoomById.bind(videoRoomController));

router.patch('/:roomId/end', videoRoomController.endRoom.bind(videoRoomController));

router.patch('/:roomId/delay', videoRoomController.updateDelay.bind(videoRoomController));

router.get('/:roomId/delay', videoRoomController.getDelayConfig.bind(videoRoomController));

router.get('/:roomId/sessions', videoRoomController.getActiveSessions.bind(videoRoomController));

router.get(
  '/mission/:missionId/history',
  videoRoomController.getRoomHistory.bind(videoRoomController)
);

export default router;
