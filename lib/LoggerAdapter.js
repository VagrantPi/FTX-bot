const log4js = require('log4js');

class LoggerAdapter {

  static instance;

  constructor({ logLevel = 'debug' } = {}) {
    if (!LoggerAdapter.instance) {
      this.loggerAdapter = log4js.getLogger('ftx-bot');
      this.loggerAdapter.level = logLevel;
      
      this.info =(data) => {
        this.loggerAdapter.info('%s %s', Math.floor(new Date() / 1000), data);
      }
      this.debug =(data) => {
        this.loggerAdapter.debug('%s %s', Math.floor(new Date() / 1000), data);
      }
      this.error =(data) => {
        this.loggerAdapter.error('%s %s', Math.floor(new Date() / 1000), data);
      }
      this.trace =(data) => {
        this.loggerAdapter.trace('%s %s', Math.floor(new Date() / 1000), data);
      }
      
      LoggerAdapter.instance = this;
    }
    return LoggerAdapter.instance;
    
  }
}

module.exports = LoggerAdapter;