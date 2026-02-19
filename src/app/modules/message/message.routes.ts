import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import { MessageController } from './message.controller';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();

// Send a message
router.post('/',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  fileAndBodyProcessorUsingDiskStorage(),
  MessageController.sendMessage
);

// Get messages for a chat
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  MessageController.getMessage
);

// Update a message
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  MessageController.updateMessage
);

// Get total unread count
router.get(
  '/unread/count',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  MessageController.getUnreadCount
);

// Update money request status (accept/reject)
router.patch(
  '/:messageId/money-request',
  auth(USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  MessageController.updateMoneyRequestStatus
);

// Delete a message
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  MessageController.deleteMessage
);


export const MessageRoutes = router;
