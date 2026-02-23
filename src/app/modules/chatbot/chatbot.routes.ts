import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import { ChatbotController } from './chatbot.controller';

const router = express.Router();

// Get chatbot categories (Open to all roles)
router.get(
    '/categories',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    ChatbotController.getAllCategories
);

// Get chat history
router.get(
    '/history',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    ChatbotController.getChatHistory
);

// Ask AI (HTTP fallback for socket)
router.post(
    '/ask',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    ChatbotController.askAI
);

export const ChatbotRoutes = router;
