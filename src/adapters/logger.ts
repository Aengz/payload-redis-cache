import pino from 'pino'

export const logger = pino({
  ...(process.env.LOGGER_TRANSPORT
    ? {
        transport: {
          target: process.env.LOGGER_TRANSPORT
        }
      }
    : null)
})
