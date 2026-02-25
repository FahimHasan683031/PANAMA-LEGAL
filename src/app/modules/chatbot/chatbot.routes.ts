import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import { ChatbotController } from './chatbot.controller';
import validateRequest from '../../middleware/validateRequest';
import { ChatbotValidations } from './chatbot.validation';

const router = express.Router();

// Categories
router.get(
    '/categories',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    ChatbotController.getAllCategories
);

router.get(
    '/categories/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    ChatbotController.getSingleCategory
);

router.post(
    '/categories',
    auth(USER_ROLES.ADMIN),
    validateRequest(ChatbotValidations.createCategorySchema),
    ChatbotController.createCategory
);

router.patch(
    '/categories/:id',
    auth(USER_ROLES.ADMIN),
    validateRequest(ChatbotValidations.updateCategorySchema),
    ChatbotController.updateCategory
);

router.delete(
    '/categories/:id',
    auth(USER_ROLES.ADMIN),
    ChatbotController.deleteCategory
);

// History
router.get(
    '/history',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    ChatbotController.getChatHistory
);

// Ask AI (HTTP fallback for socket)
router.post(
    '/ask',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    validateRequest(ChatbotValidations.askAISchema),
    ChatbotController.askAI
);

export const ChatbotRoutes = router;
