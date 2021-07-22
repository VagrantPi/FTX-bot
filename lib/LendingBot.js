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
  }

  async start() {
    const intervalTime = 3600000;

    setInterval(async () => {
      try {
        await this.getBalance();

        for (let i = 0; i < this.updateCoins.length; i += 1) {
          const updateCoin = this.updateCoins[i];

          // save balance to DB
          // eslint-disable-next-line no-await-in-loop
          await this.db.Balance.create({
            coin: updateCoin,
            balance: this.coinTables[updateCoin].total,
            timestamp: new Date(),
          });

          // eslint-disable-next-line no-await-in-loop
          await this.updateBalance({ coin: updateCoin, size: this.coinTables[updateCoin].total });
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
    }
  }

  async updateBalance({ coin, size }) {
    const body = {
      coin,
      size,
      rate: 0.0000001,
    };
    // eslint-disable-next-line no-await-in-loop
    const lendingResponse = await this.httpAgent.post({
      path: 'spot_margin/offers',
      secret: this.config.ftx.apiSecret,
      apiKey: this.config.ftx.apiKey,
      body,
    });
    if (!lendingResponse.success) this.logger.log(`update ${coin} lending balance false!`);
    this.logger.log(lendingResponse);
  }
}

module.exports = LendingBot;
