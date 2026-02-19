import { StatusCodes } from 'http-status-codes';
import { ILoginData } from '../../../interfaces/auth';
import ApiError from '../../../errors/ApiError';
import { USER_ROLES, USER_STATUS } from '../../../enum/user';
import { User } from '../user/user.model';
import { AuthHelper } from './auth.helper';
import { generateOtp } from '../../../utils/crypto';
import { IAuthResponse } from './auth.interface';
import { IUser } from '../user/user.interface';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { authResponse } from './auth.helper';


const login = async (payload: ILoginData): Promise<IAuthResponse> => {
    const { email, phone } = payload;
    const query = email ? { email: email.toLowerCase().trim() } : { phone: phone };

    const isUserExist = await User.findOne({
        ...query,
        status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED] },
    })
        .select('+password +authentication')
        .lean();

    if (!isUserExist) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `No account found with this ${email ? 'email' : 'phone'}`,
        );
    }

    const { authentication, verified, status, password } = isUserExist;
    const { restrictionLeftAt } = authentication;

    if (!verified) {
        const otp = generateOtp();
        const otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000);

        const updatedAuthentication = {
            ...authentication,
            oneTimeCode: otp,
            expiresAt: otpExpiresIn,
            latestRequestAt: new Date(),
            authType: 'createAccount',
        };

        await User.findByIdAndUpdate(isUserExist._id, {
            $set: { authentication: updatedAuthentication },
        });

        const otpTemplate = emailTemplate.createAccount({
            name: isUserExist.fullName!,
            email: isUserExist.email!,
            otp,
        });

        setTimeout(() => {
            emailHelper.sendEmail(otpTemplate);
        }, 0);

        return authResponse(
            StatusCodes.PROXY_AUTHENTICATION_REQUIRED,
            `An OTP has been sent to your ${payload.email}. Please verify.`
        );
    }

    if (status === USER_STATUS.DELETED) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No account found with this email');
    }

    if (status === USER_STATUS.RESTRICTED) {
        if (restrictionLeftAt && new Date() < restrictionLeftAt) {
            const remainingMinutes = Math.ceil((restrictionLeftAt.getTime() - Date.now()) / 60000);
            throw new ApiError(
                StatusCodes.TOO_MANY_REQUESTS,
                `You are restricted to login for ${remainingMinutes} minutes`
            );
        }

        await User.findByIdAndUpdate(isUserExist._id, {
            $set: {
                authentication: { ...authentication, restrictionLeftAt: null, wrongLoginAttempts: 0 },
                status: USER_STATUS.ACTIVE,
            },
        });
    }

    const isPasswordMatched = await User.isPasswordMatched(payload.password!, password);
    if (!isPasswordMatched) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Incorrect password, please try again.');
    }

    await User.findByIdAndUpdate(
        isUserExist._id,
        {
            $set: {
                fcmToken: payload.fcmToken,
                authentication: {
                    ...authentication,
                    restrictionLeftAt: null,
                    wrongLoginAttempts: 0,
                },
            },
        },
        { new: true }
    );

    const tokens = AuthHelper.createToken(
        isUserExist._id,
        isUserExist.role,
        isUserExist.fullName,
        isUserExist.email
    );

    const userInfo = {
        id: isUserExist._id,
        role: isUserExist.role,
        fullName: isUserExist.fullName!,
        email: isUserExist.email!,
        image: isUserExist.image!,
    };

    return authResponse(
        StatusCodes.OK,
        `Welcome back ${isUserExist.fullName!}`,
        undefined,
        tokens.accessToken,
        tokens.refreshToken,
        undefined,
        userInfo
    );
};

const adminLogin = async (payload: ILoginData): Promise<IAuthResponse> => {
    const { email, phone } = payload;
    const query = email ? { email: email.trim().toLowerCase() } : { phone: phone };

    const isUserExist = await User.findOne({ ...query })
        .select('+password +authentication')
        .lean();

    if (!isUserExist) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `No account found with this ${email ? 'email' : 'phone'}`
        );
    }

    if (isUserExist.role !== USER_ROLES.ADMIN) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to login as admin');
    }

    const isPasswordMatch = await AuthHelper.isPasswordMatched(
        payload.password!,
        isUserExist.password as string
    );

    if (!isPasswordMatch) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Please try again with correct credentials.');
    }

    const tokens = AuthHelper.createToken(
        isUserExist._id,
        isUserExist.role,
        isUserExist.fullName,
        isUserExist.email
    );

    const userInfo = {
        id: isUserExist._id,
        role: isUserExist.role,
        fullName: isUserExist.fullName!,
        email: isUserExist.email!,
        image: isUserExist.image!,
    };

    return authResponse(
        StatusCodes.OK,
        `Welcome back ${isUserExist.fullName}`,
        isUserExist.role,
        tokens.accessToken,
        tokens.refreshToken,
        undefined,
        userInfo
    );
};

export const LoginService = {
    login,
    adminLogin,
};
