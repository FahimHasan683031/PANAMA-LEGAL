import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { IUser, UserModel } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import config from "../../../config";
import { USER_ROLES, USER_STATUS } from "../../../enum/user";

const UserSchema = new Schema(
    {
        fullName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        password: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(USER_STATUS),
            default: USER_STATUS.ACTIVE,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            required: true,
        },
        authentication: {
            restrictionLeftAt: {
                type: Date,
                default: null,
            },
            resetPassword: {
                type: Boolean,
                default: false,
            },
            wrongLoginAttempts: {
                type: Number,
                default: 0,
            },
            passwordChangedAt: Date,
            oneTimeCode: {
                type: String,
                default: "",
            },
            latestRequestAt: {
                type: Date,
                default: Date.now,
            },
            expiresAt: Date,
            requestCount: {
                type: Number,
                default: 0,
            },
            authType: {
                type: String,
                enum: ['createAccount', 'resetPassword'],
            },
        },
        fcmToken: {
            type: String,
            default: "",
        },

        // Citizen fields
        residentialArea: String,
        dateOfBirth: Date,
        exactAddress: String,

        // Lawyer fields
        workArea: String,
        identityNumber: {
            type: String,
            sparse: true,
            unique: true,
        },
        suitabilityCertificate: {
            type: [String],
            default: undefined,
        },

        // Expert fields
        identityDoc: {
            type: [String],
            default: undefined,
        },
        technicalSpecialty: {
            type: [String],
            default: undefined,
        },

        // Student fields
        university: String,
        currentYear: Number,
        studentIdOrEnrollmentProof: {
            type: [String],
            default: undefined,
        },

        // Rating fields
        averageRating: {
            type: Number,
            default: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Static methods
UserSchema.statics.isPasswordMatched = async function (
    givenPassword: string,
    savedPassword: string
) {
    return bcrypt.compare(givenPassword, savedPassword);
};

UserSchema.statics.isEmailExists = async function (email: string) {
    const user = await this.findOne({
        email: email.toLowerCase(),
        status: { $ne: USER_STATUS.DELETED }
    });
    return !!user;
};

UserSchema.statics.isPhoneExists = async function (phone: string) {
    const user = await this.findOne({
        phoneNumber: phone,
        status: { $ne: USER_STATUS.DELETED }
    });
    return !!user;
};

// Pre-save middleware
UserSchema.pre("save", async function (next) {
    try {
        if (this.isModified("email")) {
            const isExist = await User.findOne({
                email: this.email,
                status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED] },
                _id: { $ne: this._id },
            });

            if (isExist) {
                return next(
                    new ApiError(
                        StatusCodes.BAD_REQUEST,
                        "An account with this email already exists"
                    )
                );
            }
        }

        if (this.isModified("phoneNumber")) {
            const isExist = await User.findOne({
                phoneNumber: this.phoneNumber,
                status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED] },
                _id: { $ne: this._id },
            });

            if (isExist) {
                return next(
                    new ApiError(
                        StatusCodes.BAD_REQUEST,
                        "An account with this phone number already exists"
                    )
                );
            }
        }

        if (this.isModified("identityNumber") && this.identityNumber) {
            const isExist = await User.findOne({
                identityNumber: this.identityNumber,
                _id: { $ne: this._id },
            });

            if (isExist) {
                return next(
                    new ApiError(
                        StatusCodes.BAD_REQUEST,
                        "This identity number already exists"
                    )
                );
            }
        }

        if (this.isModified("password")) {
            this.password = await bcrypt.hash(
                this.password,
                Number(config.bcrypt_salt_rounds)
            );
        }

        next();
    } catch (error) {
        next(error as Error);
    }
});


export const User = mongoose.model<IUser, UserModel>("User", UserSchema);