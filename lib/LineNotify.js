const FormData = require('form-data');
const HttpAgent = require('./HttpAgent');

class LineNotify {
  constructor({ config, logger }) {
    this.config = config;
    this.logger = logger;
    this.httpAgent = new HttpAgent({ apiURL: 'https://notify-api.line.me' });
  }

  // eslint-disable-next-line class-methods-use-this
  async notify({ message }) {
    const form = new FormData();
    form.append('stickerPackageId', '11539');
    form.append('stickerId', '52114114');
    form.append('message', message);

    this.httpAgent.setHeaders({
      Authorization: `Bearer ${this.config.line.access_token}`,
      'content-type': form.getHeaders()['content-type'],
    });

    await this.httpAgent.post({ path: '/api/notify', body: form });
  }
}

module.exports = LineNotify;
