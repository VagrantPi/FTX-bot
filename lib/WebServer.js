const cron = require('node-cron');
const Koa = require('koa');
const BigNumber = require('bignumber.js');
const Router = require('koa-router');
const Metric = require('./Metric');
const LineNotify = require('./LineNotify');
const LendingBot = require('./LendingBot');

class WebServer {
  constructor({
    config, logger, db, httpAgent, updateCoins,
  }) {
    this.config = config;
    this.logger = logger;
    this.db = db;
    this.httpAgent = httpAgent;
    this.updateCoins = updateCoins;
    this.cacheTable = {};
    this.cacheTimeout = 60 * 1000;
    this.lendingBot = new LendingBot({
      config: this.config, logger: this.logger, db: this.db, httpAgent: this.httpAgent, updateCoins: this.updateCoins,
    });
    this.metric = new Metric({
      config: this.config, logger: this.logger, db: this.db, httpAgent: this.httpAgent,
    });
    this.lineNotify = new LineNotify({ config: this.config, logger: this.logger });
  }

  async getAPYByCoin({ coin }) {
    if (this.cacheTable[coin] && this.cacheTable[coin].timestamp > new Date(new Date() - this.cacheTimeout)) {
      return this.cacheTable[coin].data;
    }

    const data = await this.metric.getAPY({ coin });
    this.cacheTable[coin] = {
      coin,
      timestamp: new Date(),
      data,
    };
    return data;
  }

  async getAllAPY() {
    for (let i = 0; i < this.updateCoins.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.getAPYByCoin({ coin: this.updateCoins[i] });
    }
  }

  async getDailyAllEarn() {
    await this.getAllAPY();

    let sum = new BigNumber(0);
    // eslint-disable-next-line no-restricted-syntax
    for (const coinItem of Object.values(this.cacheTable)) {
      // eslint-disable-next-line no-await-in-loop
      const rateItem = await this.db.Rate.findOne({
        where: { coin: coinItem.coin },
      });
      sum = (coinItem.coin === 'USD')
        ? sum.plus(new BigNumber(coinItem.data.DailyEarn))
        : sum.plus(new BigNumber(coinItem.data.DailyEarn).multipliedBy(new BigNumber(rateItem.rate)));
    }

    return sum.toFixed();
  }

  async start() {
    const app = new Koa();
    const router = new Router();
    await this.lendingBot.start();

    router.get('/apy/:coin', async (ctx, next) => {
      if (this.updateCoins.findIndex((item) => item === ctx.params.coin) === -1) return null;
      ctx.body = await this.getAPYByCoin({ coin: ctx.params.coin });
      return next();
    });

    router.get('/apy', async (ctx, next) => {
      await this.getAllAPY();
      ctx.body = this.cacheTable;
      return next();
    });

    router.get('/daily/earn', async (ctx, next) => {
      const DailyEarn = await this.getDailyAllEarn();
      ctx.body = {
        DailyEarn,
      };
      return next();
    });

    router.get('/notify', async (ctx, next) => {
      await this.getAllAPY();

      let message = '';
      Object.values(this.cacheTable).forEach((item) => {
        message += `
${item.coin}:
DailyEarn: ${item.data.DailyEarn}
DailyAPY: ${item.data.DailyAPY}%
`;
      });

      const totalDailyEarn = await this.getDailyAllEarn();
      message += `===============

daily total: ${totalDailyEarn} USD`;

      await this.lineNotify.notify({ message });
      ctx.body = {};
      return next();
    });

    cron.schedule('0 0 18 * * *', async () => {
      await this.getAllAPY();

      let message = '';
      Object.values(this.cacheTable).forEach((item) => {
        message += `
${item.coin}:
DailyEarn: ${item.data.DailyEarn}
DailyAPY: ${item.data.DailyAPY}%
`;
      });

      const totalDailyEarn = await this.getDailyAllEarn();
      message += `===============

daily total: ${totalDailyEarn} USD`;

      await this.lineNotify.notify({ message });
    }, {
      timezone: 'Asia/Taipei',
    });

    app
      .use(router.routes())
      .use(router.allowedMethods());

    app.listen(3000);
  }
}

module.exports = WebServer;
