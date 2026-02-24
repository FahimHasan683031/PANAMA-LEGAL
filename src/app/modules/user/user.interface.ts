import { Model, Types } from "mongoose";
import { USER_ROLES, USER_STATUS } from "../../../enum/user";

export type IAuthentication = {
    restrictionLeftAt: Date | null;
    resetPassword: boolean;
    wrongLoginAttempts: number;
    passwordChangedAt?: Date;
    oneTimeCode: string;
    latestRequestAt: Date;
    expiresAt?: Date;
    requestCount?: number;
    authType?: 'createAccount' | 'resetPassword';
};

export type IUser = {
    _id: Types.ObjectId;
    fullName?: string;
    email: string;
    image?: string;
    password: string;
    phoneNumber: string;
    status: USER_STATUS;
    verified: boolean;
    role: USER_ROLES;
    authentication: IAuthentication;
    fcmToken?: string;

    // Citizen specific fields
    residentialArea?: string;
    dateOfBirth?: Date;
    exactAddress?: string;

    // Lawyer specific fields
    workArea?: string;
    identityNumber?: string;
    suitabilityCertificate?: string[];

    // Expert specific fields
    identityDoc?: string[];
    technicalSpecialty?: string[];

    // Student specific fields
    university?: string;
    currentYear?: number;
    studentIdOrEnrollmentProof?: string[];

    // Lawyer rating fields
    averageRating: number;
    totalReviews: number;

    // Subscription fields
    isSubscribed: boolean;
    subscriptionExpiry: Date | null;
};

export type UserModel = {
    isPasswordMatched: (givenPassword: string, savedPassword: string) => Promise<boolean>;
    isEmailExists: (email: string) => Promise<boolean>;
    isPhoneExists: (phone: string) => Promise<boolean>;
} & Model<IUser>;