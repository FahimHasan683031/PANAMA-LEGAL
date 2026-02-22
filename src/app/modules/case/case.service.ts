import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ICase } from './case.interface';
import { Case } from './case.model';

const createCaseToDB = async (payload: Partial<ICase>): Promise<ICase> => {
    const isExist = await Case.findOne({
        citizen: payload.citizen,
        lawyer: payload.lawyer,
        status: 'pending'
    });

    if (isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'A pending case already exists for this lawyer');
    }

    const result = await Case.create(payload);
    return result;
};

const getCasesFromDB = async (user: JwtPayload, query: Record<string, unknown>) => {
    const caseQuery = new QueryBuilder(
        Case.find({
            $or: [
                { citizen: user.authId },
                { lawyer: user.authId }
            ]
        }),
        query
    )
        .search(['title', 'description'])
        .filter()
        .sort()
        .paginate();

    const result = await caseQuery.modelQuery
        .populate('citizen', 'fullName profilePicture email')
        .populate('lawyer', 'fullName profilePicture email')
        .populate('lastMessage')
        .lean();

    const pagination = await caseQuery.getPaginationInfo();

    return {
        data: result,
        pagination
    };
};

const getCaseByIdFromDB = async (id: string, user: JwtPayload): Promise<ICase | null> => {
    const result = await Case.findById(id)
        .populate('citizen', 'fullName profilePicture email')
        .populate('lawyer', 'fullName profilePicture email')
        .populate('lastMessage');

    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Case not found');
    }

    if (result.citizen._id.toString() !== user.authId && result.lawyer._id.toString() !== user.authId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view this case');
    }

    return result;
};

const updateCaseStatusToDB = async (id: string, user: JwtPayload, status: string): Promise<ICase | null> => {
    const isExist = await Case.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Case not found');
    }

    // Role-based status update logic
    if (user.role === 'lawyer') {
        if (isExist.lawyer.toString() !== user.authId) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this case');
        }
        // Lawyer can accept or cancel
        if (!['accepted', 'cancelled', 'closed'].includes(status)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status update for lawyer');
        }
    } else if (user.role === 'citizen') {
        if (isExist.citizen.toString() !== user.authId) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this case');
        }
        // Citizen can cancel or close
        if (!['cancelled', 'closed'].includes(status)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status update for citizen');
        }
    } else if (user.role !== 'admin') {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this case');
    }

    const result = await Case.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );

    return result;
};

export const CaseService = {
    createCaseToDB,
    getCasesFromDB,
    getCaseByIdFromDB,
    updateCaseStatusToDB
};
