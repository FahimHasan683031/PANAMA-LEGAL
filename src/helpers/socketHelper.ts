import colors from 'colors'
import { Server } from 'socket.io'
import { logger } from '../shared/logger'
import { handleChatbotSocket } from '../app/modules/chatbot/chatbot.socket'

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'))

    // AI Chatbot socket handler
    handleChatbotSocket(socket);

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'))
    })
  })
}

export const socketHelper = { socket }


