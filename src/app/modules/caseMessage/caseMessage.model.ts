import { Schema, model } from 'mongoose';
import { ICaseMessage, CaseMessageModel } from './caseMessage.interface';

const caseMessageSchema = new Schema<ICaseMessage, CaseMessageModel>(
    {
        caseId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Case',
        },
        sender: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        text: {
            type: String,
            required: false
        },
        files: {
            type: [String],
            required: false
        },
        readBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
    },
    {
        timestamps: true,
    }
);

export const CaseMessage = model<ICaseMessage, CaseMessageModel>('CaseMessage', caseMessageSchema);
