const { Router } = require("express");

const winston = require('winston');
const { MongoDB } = require('winston-mongodb');

const router = Router();

const logger = winston.createLogger({

  transports: [
    new MongoDB({
        level: 'error',
        options: { useUnifiedTopology: true },
        db: process.env.MONGO_URI,
        collection: 'logger',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
        )
    }),
    new MongoDB({
        level: 'info',
        options: { useUnifiedTopology: true },
        db: process.env.MONGO_URI,
        collection: 'logger',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
    }),
    new MongoDB({
      level: 'verbose',
      options: { useUnifiedTopology: true },
      db: process.env.MONGO_URI,
      collection: 'logger',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    // new winston.transports.Stream({
    //   stream: httpLogStream,
    //   level: 'http',
    // }),
  ],
});

// Middleware to set endpoint before logging
logger.middleware = function(req, res, next) {
    this.setEndpoint(req.originalUrl);
    next();
};

// Define the setEndpoint function
logger.setEndpoint = function(endpoint) {
    this.endpoint = endpoint;
};

logger.verbose('This is a verbose message', { context: 'myModule' });

// Route to receive logs and send them to Salesforce
router.post('/api/logs', (req, res) => {
    const { level, message, meta } = req.body;
    
    if (!level || !message) {
        return res.status(400).json({ error: 'Level and message are required.' });
    }

    // Send log to Salesforce CRM
    logger.sendToSalesforce(level, message, meta);

    res.status(200).json({ success: true });
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;