const BigNumber = require('bignumber.js');

class Metric {
  constructor({
    config, logger, db, httpAgent,
  }) {
    this.config = config;
    this.logger = logger;
    this.db = db;
    this.httpAgent = httpAgent;
  }

  async getAPY({ coin }) {
    const findAllBalance = await this.db.Balance.findAll({
      where: { coin },
      order: [['id', 'ASC']],
    });

    const result = {
      DailyEarn: '0',
      WeekEarn: '0',
      MonthEarn: '0',
      TotalEarn: '0',
      DailyAPY: '0',
      WeeklyAPY: '0',
      MonthAPY: '0',
      TotalAPY: '0',
    };

    if (!findAllBalance || findAllBalance.length === 0) return result;

    const initialItem = findAllBalance[0];
    const tailItem = findAllBalance[findAllBalance.length - 1];
    const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);
    let lendingTimesOneDay = 0
    for (let i = 1; i < findAllBalance.length; i += 1) {
      const item = findAllBalance[i];
      if (item.timestamp > oneMonthAgo) {
        result.MonthEarn = item.balance;

        if (item.timestamp > oneWeekAgo) {
          result.WeekEarn = item.balance;

          if (item.timestamp > oneDayAgo) {
            result.DailyEarn = item.balance;
            lendingTimesOneDay += 1;
          }
        }
      }
    }

    // calculator Earn & API
    result.DailyEarn = (new BigNumber(result.DailyEarn)).minus(new BigNumber(initialItem.balance)).toFixed();
    result.WeekEarn = (new BigNumber(result.WeekEarn)).minus(new BigNumber(initialItem.balance)).toFixed();
    result.MonthEarn = (new BigNumber(result.MonthEarn)).minus(new BigNumber(initialItem.balance)).toFixed();
    result.TotalEarn = (new BigNumber(tailItem.balance)).minus(new BigNumber(initialItem.balance)).toFixed();

    result.DailyAPY = new BigNumber(result.DailyEarn)
      .dividedBy(new BigNumber(initialItem.balance)) // earn/day
      .multipliedBy(365) // * 365
      .multipliedBy(100) // 100%
      .toFixed(2);

    result.WeeklyAPY = new BigNumber(result.WeekEarn)
      .dividedBy(new BigNumber(initialItem.balance)) // earn/week
      .dividedBy(new BigNumber(7)) // earn/day
      .multipliedBy(365) // * 365
      .multipliedBy(100) // 100%
      .toFixed(2);

    result.MonthAPY = new BigNumber(result.MonthEarn)
      .dividedBy(new BigNumber(initialItem.balance)) // earn/month
      .dividedBy(new BigNumber(30)) // earn/day
      .multipliedBy(365) // * 365
      .multipliedBy(100) // 100%
      .toFixed(2);

    result.TotalAPY = new BigNumber(result.TotalEarn)
      .dividedBy(new BigNumber(initialItem.balance))
      .dividedBy(new BigNumber(findAllBalance.length)) // earn/hour
      .multipliedBy(8760) // 24 * 365
      .multipliedBy(100) // 100%
      .toFixed(2);

    result.LendingRateOneDay = new BigNumber(lendingTimesOneDay)
      .dividedBy(new BigNumber(24)) // 24 hr
      .multipliedBy(100) // 100%
      .toFixed(2);

    return result;
  }
}

module.exports = Metric;
