import { Socket } from 'socket.io';
import { ChatbotHistory } from './chatbot.model';
import { getAIStreamingResponse } from './openai.service';
import mongoose from 'mongoose';
import { IChatMessage } from './chatbot.interface';

export const handleChatbotSocket = (socket: Socket) => {
    // AI Chat event
    socket.on('ask-ai', async (data: { userId: string, message: string, topic?: string }) => {
        const { userId, message, topic } = data;

        try {
            let history = await ChatbotHistory.findOne({ user: new mongoose.Types.ObjectId(userId) });

            if (!history) {
                history = await ChatbotHistory.create({
                    user: new mongoose.Types.ObjectId(userId),
                    messages: [],
                });
            }

            // Add user message to history
            const userMsg: IChatMessage = {
                role: 'user',
                content: message,
                timestamp: new Date(),
            };
            history.messages.push(userMsg);

            // Prepare context
            const contextMessages = history.messages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content,
            }));

            let fullAIResponse = '';

            // Stream AI response with optional initial topic context
            await getAIStreamingResponse(contextMessages as any, (chunk: string) => {
                fullAIResponse += chunk;
                socket.emit(`ai-response::${userId}`, { chunk });
            }, topic);

            // Save AI response to history after streaming finishes
            const aiMsg: IChatMessage = {
                role: 'assistant',
                content: fullAIResponse,
                timestamp: new Date(),
            };
            history.messages.push(aiMsg);
            await history.save();

            // Signal completion
            socket.emit(`ai-response::${userId}`, { done: true, fullMessage: fullAIResponse });

        } catch (error) {
            console.error('AI Socket Error:', error);
            socket.emit(`ai-response::${userId}`, { error: 'Failed to get AI response' });
        }
    });
};
