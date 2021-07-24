const Koa = require('koa');
const Router = require('koa-router');
const Metric = require('./Metric');

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
    this.metric = new Metric({
      config: this.config, logger: this.logger, db: this.db, httpAgent: this.httpAgent,
    });
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

  async start() {
    const app = new Koa();
    const router = new Router();

    router.get('/apy/:coin', async (ctx, next) => {
      if (this.updateCoins.findIndex((item) => item === ctx.params.coin) === -1) return null;
      ctx.body = await this.getAPYByCoin({ coin: ctx.params.coin });
      return next();
    });

    router.get('/apy', async (ctx, next) => {
      for (let i = 0; i < this.updateCoins.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await this.getAPYByCoin({ coin: this.updateCoins[i] });
      }
      ctx.body = this.cacheTable;
      return next();
    });

    // TODO: add user all balance?
    router.get('/balance', async (ctx, next) => {
      ctx.body = {};
      return next();
    });

    app
      .use(router.routes())
      .use(router.allowedMethods());

    app.listen(3000);
  }
}

module.exports = WebServer;
