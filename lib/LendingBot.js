/* eslint-disable no-await-in-loop */

class LendingBot {
  constructor({
    config, logger, db, httpAgent, updateCoins,
  }) {
    this.config = config;
    this.logger = logger;
    this.db = db;
    this.httpAgent = httpAgent;
    this.updateCoins = updateCoins;
    this.coinTables = {};
    this.catchRate = {};
  }

  async start() {
    const intervalTime = 3600000;

    setInterval(async () => {
      try {
        await this.getBalance();

        for (let i = 0; i < this.updateCoins.length; i += 1) {
          const updateCoin = this.updateCoins[i];

          // save balance to DB
          await this.db.Balance.create({
            coin: updateCoin,
            balance: this.coinTables[updateCoin].total,
            timestamp: new Date(),
          });
          // update lending balance interval
          await this.updateBalance({ coin: updateCoin, size: this.coinTables[updateCoin].total });

          // get coin/USD value from markets
          if (updateCoin !== 'USD') {
            await this.updateRateAndCatch({ updateCoin });
          }
        }

        this.logger.log('update lending balance success!!');
      } catch (e) {
        this.logger.error('LendingBot.start error', e.message);
      }
    }, intervalTime);
  }

  async getBalance() {
    try {
      const balancesResponse = await this.httpAgent.get({
        path: 'wallet/balances', secret: this.config.ftx.apiSecret, apiKey: this.config.ftx.apiKey,
      });
      for (let i = 0; i < balancesResponse.result.length; i += 1) {
        const coinBalance = balancesResponse.result[i];
        this.coinTables[coinBalance.coin] = coinBalance;
      }
    } catch (e) {
      this.logger.error('LendingBot.getBalance error', e.message);
      throw e;
    }
  }

  async updateBalance({ coin, size }) {
    try {
      const lendingResponse = await this.httpAgent.post({
        path: 'spot_margin/offers',
        secret: this.config.ftx.apiSecret,
        apiKey: this.config.ftx.apiKey,
        body: {
          coin,
          size,
          rate: 0.0000001,
        },
      });
      if (!lendingResponse.success) this.logger.log(`update ${coin} lending balance false!`);
    } catch (e) {
      this.logger.error('LendingBot.updateBalance error', e.message);
      throw e;
    }
  }

  async updateRateAndCatch({ updateCoin}) {
    const timestamp = new Date();
    if (this.catchRate[updateCoin] && this.catchRate[updateCoin].timestamp > new Date(new Date() - this.intervalTime)) {
      return;
    }

    const coinMarketData = await this.getRate({ marketName: `${updateCoin}/USD` });
    const findData = await this.db.Rate.findOne({ where: { coin: updateCoin }});
    if (findData) {
      // update data
      await this.db.Rate.update(
        {
          rate: coinMarketData.result.ask,
          lastSyncTime: timestamp,
        }, {
          where: { coin: updateCoin },
        },
      );
    } else {
      // insert data
      await this.db.Rate.create({
        coin: updateCoin,
        rate: coinMarketData.result.ask,
        lastSyncTime: timestamp,
      });
    }

    this.catchRate[updateCoin] = {
      timestamp,
      data: {
        coin: updateCoin,
        rate: coinMarketData.result.ask,
      },
    };
  }

  async getRate({ marketName }) {
    try {
      return await this.httpAgent.get({
        path: `markets/${marketName}`, secret: this.config.ftx.apiSecret, apiKey: this.config.ftx.apiKey,
      });
    } catch (e) {
      this.logger.error('LendingBot.getRate error', e.message);
      throw e;
    }
  }
}

module.exports = LendingBot;
