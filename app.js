const Utils = require('./lib/Utils');
const HttpAgent = require('./lib/HttpAgent');
const LoggerAdapter = require('./lib/LoggerAdapter');
const DB = require('./db/model');
const LendingBot = require('./lib/LendingBot');

const main = async () => {
  const config = await Utils.readConfig();
  const logger = new LoggerAdapter();
  const httpAgent = new HttpAgent();
  const dbInstance = new DB({ dbConfig: config.database, logger });
  const db = await dbInstance.initialORM();
  logger.log('service start!!');

  const lendingBot = new LendingBot({
    config, logger, db, httpAgent,
  });
  await lendingBot.start();
};

main();
