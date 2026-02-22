import { z } from "zod";
import { USER_ROLES } from "../../../enum/user";


const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const emailSchema = z.string().email("Invalid email address").toLowerCase().trim();
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

export const userSignupSchema = z.object({
    body: z.object({
        fullName: z.string().optional(),
        email: emailSchema,
        phoneNumber: phoneSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
        role: z.nativeEnum(USER_ROLES),
        image: z.string().optional(),
    }).strict()
});

export const userLoginSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z.string().min(1, "Password is required"),
    })
});

export const userUpdateSchema = z.object({
    body: z.object({
        fullName: z.string().optional(),
        phoneNumber: phoneSchema.optional(),
        image: z.string().optional(),
        password: passwordSchema.optional(),
        fcmToken: z.string().optional(),

        residentialArea: z.string().optional(),
        dateOfBirth: z.string().or(z.date()).optional(),
        exactAddress: z.string().optional(),

        workArea: z.string().optional(),
        identityNumber: z.string().optional(),
        suitabilityCertificate: z.array(z.string()).optional(),

        identityDoc: z.string().optional(),
        technicalSpecialty: z.string().optional(),

        university: z.string().optional(),
        currentYear: z.number().int().min(1).max(6).optional(),
        studentIdOrEnrollmentProof: z.string().optional(),
    }).strict()
});

export const UserValidations = {
    userSignupSchema,
    userLoginSchema,
    userUpdateSchema,
};