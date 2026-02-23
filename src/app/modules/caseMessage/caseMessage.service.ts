import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { ICaseMessage } from './caseMessage.interface';
import { CaseMessage } from './caseMessage.model';
import { checkMongooseIDValidation } from '../../../shared/checkMongooseIDValidation';
import { Case } from '../case/case.model';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { PushNotificationService } from '../notification/pushNotification.service';
import { User } from '../user/user.model';

const sendMessageToDB = async (payload: any): Promise<ICaseMessage> => {
    // Initialize readBy with sender's ID
    payload.readBy = [payload.sender];

    if (!payload.caseId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "caseId must be provided!");
    }

    const session = await Case.findById(payload.caseId);
    if (!session) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Case doesn't exist!");
    }

    // For cases, participants are citizen and lawyer
    if (session.citizen.toString() !== payload.sender.toString() && session.lawyer.toString() !== payload.sender.toString()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are not a participant of this case!");
    }

    // Save to DB
    const response = await CaseMessage.create(payload);

    // Update session's lastMessage and lastMessageAt
    await Case.findByIdAndUpdate(payload.caseId, {
        lastMessage: response._id,
        lastMessageAt: new Date()
    });

    //@ts-ignore
    const io = global.io;
    const sessionId = payload.caseId;
    if (io && sessionId) {
        // Send message to specific room
        io.emit(`getCaseMessage::${sessionId}`, response);

        // Notify participants to update their list
        const participants = [session.citizen, session.lawyer];

        participants.forEach((participantId: any) => {
            io.emit(`caseListUpdate::${participantId.toString()}`, {
                caseId: payload.caseId,
                lastMessage: response,
            });
        });
    }

    // Send Push Notification
    try {
        const sender = await User.findById(payload.sender).select('fullName');
        const title = sender?.fullName || "New Case Message";
        const body = payload.text ?
            (payload.text.length > 50 ? payload.text.substring(0, 50) + "..." : payload.text) :
            "Sent an attachment";

        const recipientId = (session.citizen.toString() === payload.sender.toString() ? session.lawyer : session.citizen);

        if (recipientId) {
            const recipient = await User.findById(recipientId).select('fcmToken');
            if (recipient?.fcmToken) {
                await PushNotificationService.sendPushNotification(
                    recipient.fcmToken,
                    title,
                    body,
                    {
                        screen: "CASE",
                        caseId: payload.caseId?.toString()
                    }
                );
            }
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to send push notification:", error);
    }

    return response;
};

// Get Message from db
const getMessageFromDB = async (
    id: string,
    user: JwtPayload,
    query: Record<string, any>
): Promise<{ messages: ICaseMessage[], pagination: any, participant: any }> => {
    checkMongooseIDValidation(id, "Case");

    const session = await Case.findById(id);

    if (!session) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Case doesn't exist!");
    }

    const isParticipant = (session.citizen.toString() === user.authId || session.lawyer.toString() === user.authId);

    if (!isParticipant) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not participant of this case');
    }

    // Mark messages as read for this user
    await CaseMessage.updateMany(
        {
            caseId: new mongoose.Types.ObjectId(id),
            sender: { $ne: new mongoose.Types.ObjectId(user.authId) },
            readBy: { $ne: new mongoose.Types.ObjectId(user.authId) }
        },
        {
            $addToSet: { readBy: new mongoose.Types.ObjectId(user.authId) }
        }
    );

    const filter = { caseId: id };
    const result = new QueryBuilder(
        CaseMessage.find(filter)
            .populate('sender', 'fullName profilePicture')
            .sort({ createdAt: -1 }),
        query
    ).paginate();

    let messages = await result.modelQuery;
    const pagination = await result.getPaginationInfo();
    messages = messages.reverse();

    const otherId = session.citizen.toString() === user.authId ? session.lawyer : session.citizen;
    const participant = await User.findById(otherId).select('fullName profilePicture role email').lean();

    return { messages, pagination, participant };
};


// Update a message
const updateMessageToDB = async (messageId: string, userId: string, payload: Partial<ICaseMessage>): Promise<ICaseMessage | null> => {
    const message = await CaseMessage.findById(messageId);
    if (!message) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
    }

    // Check if the user is the sender
    if (message.sender.toString() !== userId) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You can only update your own messages");
    }

    // Update the message
    const updatedMessage = await CaseMessage.findByIdAndUpdate(
        messageId,
        payload,
        { new: true }
    );

    //@ts-ignore
    const io = global.io;
    if (io && updatedMessage) {
        const sessionId = updatedMessage.caseId;
        io.emit(`getCaseMessage::${sessionId}`, updatedMessage);

        const session = await Case.findById(sessionId);
        if (session) {
            const participants = [session.citizen, session.lawyer];
            participants.forEach((participantId: any) => {
                io.emit(`caseListUpdate::${participantId.toString()}`, {
                    caseId: sessionId,
                    lastMessage: updatedMessage,
                });
            });
        }
    }

    return updatedMessage;
};

// Get unread message count for a specific case
const getUnreadCountForCase = async (id: string, userId: string): Promise<number> => {
    const count = await CaseMessage.countDocuments({
        caseId: new mongoose.Types.ObjectId(id),
        sender: { $ne: new mongoose.Types.ObjectId(userId) },
        readBy: { $ne: new mongoose.Types.ObjectId(userId) }
    });

    return count;
};

// Get total unread message count for a user across all cases
const getTotalUnreadCount = async (userId: string): Promise<number> => {
    // Get all cases for this user
    const cases = await Case.find({
        $or: [
            { citizen: new mongoose.Types.ObjectId(userId) },
            { lawyer: new mongoose.Types.ObjectId(userId) }
        ]
    }).select('_id');

    const caseIds = cases.map(c => c._id).filter(id => id !== undefined);

    // Count unread messages across all case sessions
    const count = await CaseMessage.countDocuments({
        caseId: { $in: caseIds },
        sender: { $ne: new mongoose.Types.ObjectId(userId) },
        readBy: { $ne: new mongoose.Types.ObjectId(userId) }
    });

    return count;
};

// Delete message from DB
const deleteMessageFromDB = async (messageId: string, userId: string): Promise<ICaseMessage | null> => {
    const message = await CaseMessage.findById(messageId);
    if (!message) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
    }

    // Check if the user is the sender of the message
    if (message.sender.toString() !== userId) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own messages");
    }

    return await CaseMessage.findByIdAndDelete(messageId);
};

export const CaseMessageService = {
    sendMessageToDB,
    getMessageFromDB,
    updateMessageToDB,
    getUnreadCountForCase,
    getTotalUnreadCount,
    deleteMessageFromDB
};
