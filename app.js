const Utils = require('./lib/Utils');
const HttpAgent = require('./lib/HttpAgent');
const LoggerAdapter = require('./lib/LoggerAdapter');
const DB = require('./db/model');
const LendingBot = require('./lib/LendingBot');
const WebServer = require('./lib/WebServer');

const main = async () => {
  const updateCoins = ['BTC', 'ETH', 'DOGE', 'ASD', 'USD', 'USDT'];

  const config = await Utils.readConfig();
  const logger = new LoggerAdapter();
  const httpAgent = new HttpAgent();
  const dbInstance = new DB({ dbConfig: config.database, logger });
  const db = await dbInstance.initialORM();
  const webServer = new WebServer({
    config, logger, db, httpAgent, updateCoins,
  });
  logger.log('service start!!');

  const lendingBot = new LendingBot({
    config, logger, db, httpAgent, updateCoins,
  });
  await lendingBot.start();

  await webServer.start();
};

main();
