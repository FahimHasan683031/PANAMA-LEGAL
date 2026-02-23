import { Schema, model } from "mongoose";
import { IChatbotCategory, IChatbotHistory, IChatMessage } from "./chatbot.interface";

const chatbotCategorySchema = new Schema<IChatbotCategory>(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        icon: {
            type: String,
        },
        subQuestions: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const chatMessageSchema = new Schema<IChatMessage>({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const chatbotHistorySchema = new Schema<IChatbotHistory>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        messages: [chatMessageSchema],
    },
    {
        timestamps: true,
    }
);

export const ChatbotCategory = model<IChatbotCategory>("ChatbotCategory", chatbotCategorySchema);
export const ChatbotHistory = model<IChatbotHistory>("ChatbotHistory", chatbotHistorySchema);
