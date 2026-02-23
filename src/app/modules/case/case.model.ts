import { model, Schema } from 'mongoose';
import { CaseModel, ICase } from './case.interface';

const caseSchema = new Schema<ICase, CaseModel>(
    {
        title: {
            type: String,
            required: true
        },
        citizen: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        lawyer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        description: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'cancelled', 'closed'],
            default: 'pending'
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'CaseMessage'
        },
        lastMessageAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
)

export const Case = model<ICase, CaseModel>('Case', caseSchema);
