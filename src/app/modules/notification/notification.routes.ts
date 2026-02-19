import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { NotificationController } from './notification.controller';
const router = express.Router();

router.get('/',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    NotificationController.getNotificationFromDB
);

router.get('/unread-count',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    NotificationController.getUnreadCount
);


router.post('/test-push', NotificationController.sendTestPushNotification);

export const NotificationRoutes = router;
