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
        fcmToken: z.string().optional(),
        
        // Citizen fields
        residentialArea: z.string().optional(),
        dateOfBirth: z.string().optional(),
        exactAddress: z.string().optional(),
        
        // Lawyer fields
        workArea: z.string().optional(),
        identityNumber: z.string().optional(),
        suitabilityCertificate: z.array(z.string()).optional(),
        
        // Expert fields
        identityDoc: z.string().optional(),
        technicalSpecialty: z.string().optional(),
        
        // Student fields
        university: z.string().optional(),
        currentYear: z.number().int().min(1).max(6).optional(),
        studentIdOrEnrollmentProof: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })
    .superRefine((data, ctx) => {
        switch (data.role) {
            case USER_ROLES.CITIZEN:
                if (!data.residentialArea) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Residential area is required for citizens",
                        path: ["residentialArea"]
                    });
                }
                if (!data.dateOfBirth) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Date of birth is required for citizens",
                        path: ["dateOfBirth"]
                    });
                }
                if (!data.exactAddress) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Exact address is required for citizens",
                        path: ["exactAddress"]
                    });
                }
                break;

            case USER_ROLES.LAWYER:
                if (!data.workArea) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Work area is required for lawyers",
                        path: ["workArea"]
                    });
                }
                if (!data.identityNumber) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Identity number is required for lawyers",
                        path: ["identityNumber"]
                    });
                }
                if (!data.suitabilityCertificate || data.suitabilityCertificate.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Suitability certificate is required for lawyers",
                        path: ["suitabilityCertificate"]
                    });
                }
                break;

            case USER_ROLES.EXPERT:
                if (!data.identityDoc) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Identity document is required for experts",
                        path: ["identityDoc"]
                    });
                }
                if (!data.technicalSpecialty) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Technical specialty is required for experts",
                        path: ["technicalSpecialty"]
                    });
                }
                break;

            case USER_ROLES.STUDENT:
                if (!data.university) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "University is required for students",
                        path: ["university"]
                    });
                }
                if (!data.currentYear) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Current year is required for students",
                        path: ["currentYear"]
                    });
                }
                if (!data.studentIdOrEnrollmentProof) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Student ID or enrollment proof is required",
                        path: ["studentIdOrEnrollmentProof"]
                    });
                }
                break;
        }
    })
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
        email: emailSchema.optional(),
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
    })
});

export const UserValidations = {
    userSignupSchema,
    userLoginSchema,
    userUpdateSchema,
};