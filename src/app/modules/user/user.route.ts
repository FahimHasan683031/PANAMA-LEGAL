import express from 'express'
import { UserController } from './user.controller'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { USER_ROLES } from '../../../enum/user'

import fileUploadHandler from '../../middleware/fileUploadHandler'
import { UserValidations } from './user.validation'

const router = express.Router()


router.get(
  '/me',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  UserController.getProfile,
)
router.get('/', auth(USER_ROLES.ADMIN), UserController.getAllUsers);
router.patch(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  fileUploadHandler(),
  validateRequest(UserValidations.userUpdateSchema),
  UserController.updateProfile,
)


// delete my account
router.delete(
  '/me',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  UserController.deleteMyAccount,
)


// get single user
router.get('/:id', UserController.getSingleUser)


// delete user
router.delete('/:id', auth(USER_ROLES.ADMIN), UserController.deleteUser)

export const UserRoutes = router
