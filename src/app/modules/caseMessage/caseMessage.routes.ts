import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { CaseMessageController } from './caseMessage.controller';
import { CaseMessageValidation } from './caseMessage.validation';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';

const router = express.Router();

// Send a message
router.post('/',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(CaseMessageValidation.sendMessageZod),
    CaseMessageController.sendMessage
);

// Get messages for a case
router.get(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    CaseMessageController.getMessage
);

// Update a message
router.patch(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    CaseMessageController.updateMessage
);

// Get total unread count across all cases
router.get(
    '/unread/count',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    CaseMessageController.getUnreadCount
);

// Delete a message
router.delete(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    CaseMessageController.deleteMessage
);

export const CaseMessageRoutes = router;
