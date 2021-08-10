const Utils = require('./lib/Utils');
const LoggerAdapter = require('./lib/LoggerAdapter');
const FTXHTTPAgent = require('./lib/FTXHttpAgent');
const DB = require('./db/model');
const WebServer = require('./lib/WebServer');

const main = async () => {
  const config = await Utils.readConfig();
  const logger = new LoggerAdapter();
  const httpAgent = new FTXHTTPAgent();
  const dbInstance = new DB({ dbConfig: config.database, logger });
  const db = await dbInstance.initialORM();

  const webServer = new WebServer({
    config, logger, db, httpAgent, updateCoins: config.base.updateCoins,
  });
  logger.log('service start!!');

  await webServer.start();
};

main();
