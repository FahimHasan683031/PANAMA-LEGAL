import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import { checkMongooseIDValidation } from '../../../shared/checkMongooseIDValidation';
import { Chat } from '../chat/chat.model';
import { Case } from '../case/case.model';
import { MESSAGE } from '../../../enum/message';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { PushNotificationService } from '../notification/pushNotification.service';
import { User } from '../user/user.model';

const sendMessageToDB = async (payload: any): Promise<IMessage> => {
  // Initialize readBy with sender's ID
  payload.readBy = [payload.sender];

  let session: any;

  if (payload.chatId) {
    session = await Chat.findById(payload.chatId);
    if (!session) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Chat doesn't exist!");
    }
    if (!session.participants.some((p: any) => p.toString() === payload.sender.toString())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "You are not a participant!");
    }
  } else if (payload.caseId) {
    session = await Case.findById(payload.caseId);
    if (!session) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Case doesn't exist!");
    }
    // For cases, participants are citizen and lawyer
    if (session.citizen.toString() !== payload.sender.toString() && session.lawyer.toString() !== payload.sender.toString()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "You are not a participant of this case!");
    }
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Either chatId or caseId must be provided!");
  }

  // Save to DB
  const response = await Message.create(payload);

  // Update session's lastMessage and lastMessageAt
  if (payload.chatId) {
    await Chat.findByIdAndUpdate(payload.chatId, {
      lastMessage: response._id,
      lastMessageAt: new Date()
    });
  } else if (payload.caseId) {
    await Case.findByIdAndUpdate(payload.caseId, {
      lastMessage: response._id,
      lastMessageAt: new Date()
    });
  }

  //@ts-ignore
  const io = global.io;
  const sessionId = payload.chatId || payload.caseId;
  if (io && sessionId) {
    // Send message to specific room
    io.emit(`getMessage::${sessionId}`, response);

    // Notify participants to update their list
    const participants = payload.chatId
      ? session.participants
      : [session.citizen, session.lawyer];

    participants.forEach((participantId: any) => {
      io.emit(`chatListUpdate::${participantId.toString()}`, {
        chatId: payload.chatId,
        caseId: payload.caseId,
        lastMessage: response,
      });
    });
  }

  // Send Push Notification
  try {
    const sender = await User.findById(payload.sender).select('fullName');
    const title = sender?.fullName || "New Message";
    const body = payload.text ?
      (payload.text.length > 50 ? payload.text.substring(0, 50) + "..." : payload.text) :
      "Sent an attachment";

    const recipientId = payload.chatId
      ? session.participants.find((p: any) => p.toString() !== payload.sender.toString())
      : (session.citizen.toString() === payload.sender.toString() ? session.lawyer : session.citizen);

    if (recipientId) {
      const recipient = await User.findById(recipientId).select('fcmToken');
      if (recipient?.fcmToken) {
        await PushNotificationService.sendPushNotification(
          recipient.fcmToken,
          title,
          body,
          {
            screen: payload.chatId ? "CHAT" : "CASE",
            chatId: payload.chatId?.toString(),
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
): Promise<{ messages: IMessage[], pagination: any, participant: any }> => {
  checkMongooseIDValidation(id, "Session");

  let session: any = await Chat.findById(id);
  let isCase = false;

  if (!session) {
    session = await Case.findById(id);
    isCase = true;
  }

  if (!session) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Session doesn't exist!");
  }

  const isParticipant = isCase
    ? (session.citizen.toString() === user.id || session.lawyer.toString() === user.id)
    : session.participants.some((p: any) => p.toString() === user.id.toString());

  if (!isParticipant) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not participant of this chat/case');
  }

  // Mark messages as read for this user
  await Message.updateMany(
    {
      $or: [{ chatId: new mongoose.Types.ObjectId(id) }, { caseId: new mongoose.Types.ObjectId(id) }],
      sender: { $ne: new mongoose.Types.ObjectId(user.id) },
      readBy: { $ne: new mongoose.Types.ObjectId(user.id) }
    },
    {
      $addToSet: { readBy: new mongoose.Types.ObjectId(user.id) }
    }
  );

  const filter = isCase ? { caseId: id } : { chatId: id };
  const result = new QueryBuilder(
    Message.find(filter)
      .populate('sender', 'fullName profilePicture')
      .sort({ createdAt: -1 }),
    query
  ).paginate();

  let messages = await result.modelQuery;
  const pagination = await result.getPaginationInfo();
  messages = messages.reverse();

  let participant;
  if (isCase) {
    const otherId = session.citizen.toString() === user.id ? session.lawyer : session.citizen;
    participant = await User.findById(otherId).select('fullName profilePicture role email').lean();
  } else {
    const otherParticipant = session.participants.find((p: any) => p.toString() !== user.id);
    participant = await User.findById(otherParticipant).select('fullName profilePicture role email').lean();
  }

  return { messages, pagination, participant };
};


// Update a message
const updateMessageToDB = async (messageId: string, userId: string, payload: Partial<IMessage>): Promise<IMessage | null> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
  }

  // Check if the user is the sender
  if (message.sender.toString() !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only update your own messages");
  }

  // Update the message
  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    payload,
    { new: true }
  );

  //@ts-ignore
  const io = global.io;
  if (io && updatedMessage) {
    const sessionId = updatedMessage.chatId || updatedMessage.caseId;
    io.emit(`getMessage::${sessionId}`, updatedMessage);
  }

  return updatedMessage;
};

// Get unread message count for a specific chat/case
const getUnreadCountForChat = async (id: string, userId: string): Promise<number> => {
  const count = await Message.countDocuments({
    $or: [{ chatId: new mongoose.Types.ObjectId(id) }, { caseId: new mongoose.Types.ObjectId(id) }],
    sender: { $ne: new mongoose.Types.ObjectId(userId) },
    readBy: { $ne: new mongoose.Types.ObjectId(userId) }
  });

  return count;
};

// Get total unread message count for a user
const getTotalUnreadCount = async (userId: string): Promise<number> => {
  // Get all chats for this user
  const chats = await Chat.find({
    participants: new mongoose.Types.ObjectId(userId)
  }).select('_id');

  // Get all cases for this user
  const cases = await Case.find({
    $or: [
      { citizen: new mongoose.Types.ObjectId(userId) },
      { lawyer: new mongoose.Types.ObjectId(userId) }
    ]
  }).select('_id');

  const chatIds = chats.map(c => c._id).filter(id => id !== undefined);
  const caseIds = cases.map(c => c._id).filter(id => id !== undefined);

  // Count unread messages across all sessions
  const count = await Message.countDocuments({
    $or: [
      { chatId: { $in: chatIds } },
      { caseId: { $in: caseIds } }
    ],
    sender: { $ne: new mongoose.Types.ObjectId(userId) },
    readBy: { $ne: new mongoose.Types.ObjectId(userId) }
  });

  return count;
};

// Delete message from DB
const deleteMessageFromDB = async (messageId: string, userId: string): Promise<IMessage | null> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
  }

  // Check if the user is the sender of the message
  if (message.sender.toString() !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own messages");
  }

  return await Message.findByIdAndDelete(messageId);
};

const updateMoneyRequestStatusToDB = async (messageId: string, user: JwtPayload, status: 'accepted' | 'rejected') => {
  return null;
};

export const MessageService = {
  sendMessageToDB,
  getMessageFromDB,
  updateMessageToDB,
  getUnreadCountForChat,
  getTotalUnreadCount,
  deleteMessageFromDB,
  updateMoneyRequestStatusToDB
};