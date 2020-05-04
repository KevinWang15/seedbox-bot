const winston = require('winston')
const util = require('util')
const logFormat = winston.format.printf(function (info) {
  let result = `${new Date().toISOString()} [${info.service}:${info.level}]: ${info.message}`
  try {
    info[Symbol.for('splat')].forEach(item => {
      result += ' '
      result += util.inspect(item, { colors: true })
    })
  } catch (e) {
  }
  return result
})

const logger = winston.createLogger({
  defaultMeta: { service: 'server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ],
})

export default logger