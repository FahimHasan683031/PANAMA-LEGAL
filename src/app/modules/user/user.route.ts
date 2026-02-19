import express from 'express'
import { UserController } from './user.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import fileUploadHandler from '../../middleware/fileUploadHandler'

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
