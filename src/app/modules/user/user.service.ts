import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IUser } from './user.interface'
import { User } from './user.model'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'
import { JwtPayload } from 'jsonwebtoken'
import { logger } from '../../../shared/logger'
import QueryBuilder from '../../builder/QueryBuilder'
import config from '../../../config'


const getAllUsers = async (query: Record<string, unknown>) => {
    const userQueryBuilder = new QueryBuilder(User.find().select('-password -authentication'), query)
        .search(['email', 'fullName', 'phoneNumber'])
        .filter()
        .sort()
        .fields()
        .paginate()

    const users = await userQueryBuilder.modelQuery
    const meta = await userQueryBuilder.getPaginationInfo()

    return {
        users,
        meta,
    }
}

const getSingleUser = async (id: string) => {
    const result = await User.findById(id).select('-password -authentication')
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    return result
}

// delete User
const deleteUser = async (id: string) => {
    const isExistUser = await User.findById(id)
    if (!isExistUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    const result = await User.findByIdAndDelete(id)
    return result
}

const updateProfile = async (
    user: JwtPayload,
    payload: Partial<IUser>
) => {
    const isExistUser = await User.findById(user.authId)

    if (!isExistUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found or deleted.')
    }

    // Role-specific field isolation
    const roleFields: Record<string, string[]> = {
        [USER_ROLES.ADMIN]: [],
        [USER_ROLES.CITIZEN]: ['residentialArea', 'dateOfBirth', 'exactAddress'],
        [USER_ROLES.LAWYER]: ['workArea', 'identityNumber', 'suitabilityCertificate'],
        [USER_ROLES.EXPERT]: ['identityDoc', 'technicalSpecialty'],
        [USER_ROLES.STUDENT]: ['university', 'currentYear', 'studentIdOrEnrollmentProof'],
    };

    const allRoleSpecificFields = Object.values(roleFields).flat();
    const allowedFields = roleFields[isExistUser.role] || [];

    // Filter payload to ensure no unauthorized role fields are updated
    Object.keys(payload).forEach(key => {
        if (allRoleSpecificFields.includes(key) && !allowedFields.includes(key)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, `Field '${key}' is not allowed for your role (${isExistUser.role})`)
        }
    });

    const updatedUser = await User.findOneAndUpdate(
        { _id: user.authId, status: { $ne: USER_STATUS.DELETED } },
        payload,
        { new: true, runValidators: true },
    ).select('-password -authentication')

    if (!updatedUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update profile')
    }

    return updatedUser
}

const getProfile = async (user: JwtPayload) => {
    const result = await User.findById(user.authId).select('-password -authentication')
    if (!result) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            'The requested profile not found or deleted.',
        )
    }

    return result
}


const deleteMyAccount = async (user: JwtPayload) => {
    const isExistUser = await User.findById(user.authId)
    if (!isExistUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            'The requested profile not found or deleted.',
        )
    }

    await User.findByIdAndUpdate(isExistUser._id, {
        $set: { status: USER_STATUS.DELETED },
    })

    return 'Account deleted successfully'
}

export const UserServices = {
    updateProfile,
    getAllUsers,
    getSingleUser,
    deleteUser,
    getProfile,
    deleteMyAccount,
}

