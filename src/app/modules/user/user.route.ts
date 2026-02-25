import express from 'express'
import { UserController } from './user.controller'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { USER_ROLES } from '../../../enum/user'
import { UserValidations } from './user.validation'
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody'

const router = express.Router()


router.get(
  '/me',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  UserController.getProfile,
)

router.get('/random-lawyer',
  auth(USER_ROLES.CITIZEN),
  UserController.getRandomLawyer
)

router.get('/', auth(USER_ROLES.ADMIN), UserController.getAllUsers);

// get single user
router.get('/:id', UserController.getSingleUser)

router.patch(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(UserValidations.userUpdateSchema),
  UserController.updateProfile,
)


// delete my account
router.delete(
  '/me',
  auth(USER_ROLES.ADMIN, USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
  UserController.deleteMyAccount,
)





// delete user
router.delete('/:id', auth(USER_ROLES.ADMIN), UserController.deleteUser)

export const UserRoutes = router
