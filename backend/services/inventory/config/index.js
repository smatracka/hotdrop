module.exports = {
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/drop-commerce',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    server: {
      port: process.env.PORT || 4001
    },
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    apiServiceUrl: process.env.API_SERVICE_URL || 'http://localhost:4000'
  };