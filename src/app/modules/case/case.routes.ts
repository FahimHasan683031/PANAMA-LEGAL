import express from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLES } from '../../../enum/user';
import { CaseController } from './case.controller';
import { createCaseZod, updateCaseStatusZod } from './case.validation';

const router = express.Router();

router.post(
    '/',
    auth(USER_ROLES.CITIZEN),
    validateRequest(createCaseZod),
    CaseController.createCase
);

router.get(
    '/',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER),
    CaseController.getCases
);

router.get(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER),
    CaseController.getCaseById
);

router.patch(
    '/status/:id',
    auth(USER_ROLES.CITIZEN, USER_ROLES.LAWYER),
    validateRequest(updateCaseStatusZod),
    CaseController.updateCaseStatus
);

export const CaseRoutes = router;
