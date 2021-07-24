/* eslint-disable object-curly-newline */
const Utils = require('./Utils');
const HttpAgent = require('./HttpAgent');

class FTXHTTPAgent extends HttpAgent {
  constructor({ apiURL = '' } = {}) {
    super({ apiURL });

    if (!FTXHTTPAgent.instance) {
      FTXHTTPAgent.instance = this;
    }
    return this;
  }

  setSignatureHeader({
    method, path, secret, apiKey, body, params,
  }) {
    const timestamp = new Date().getTime().toString();
    const signature = Utils.sign({
      apiMethod: method,
      apiPath: path,
      timestamp,
      secret,
      body,
      params,
    });
    const headers = {
      'FTX-KEY': apiKey,
      'FTX-SIGN': signature,
      'FTX-TS': timestamp,
    };
    this.setHeaders(headers);
  }

  get({ path, secret, apiKey }) {
    this.setSignatureHeader({ method: 'GET', path, secret, apiKey });
    return this._request(() => this.httpLibrary.get(path));
  }

  post({ path, secret, apiKey, body }) {
    this.setSignatureHeader({ method: 'POST', path, secret, apiKey, body });
    return this._request(() => this.httpLibrary.post(path, body));
  }

  delete({ path, secret, apiKey, body }) {
    this.setSignatureHeader({ method: 'DELETE', path, secret, apiKey });
    return this._request(() => this.httpLibrary.delete(path, body));
  }

  put({ path, secret, apiKey, body }) {
    this.setSignatureHeader({ method: 'PUT', path, secret, apiKey });
    return this._request(() => this.httpLibrary.put(path, body));
  }
}

module.exports = FTXHTTPAgent;
