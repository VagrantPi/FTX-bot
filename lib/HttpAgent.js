const axios = require("axios");
const Utils = require('./Utils');

class HTTPAgent {
  static instance;

  constructor({ apiURL = '' } = {}) {
    this.url = apiURL
    if (!HTTPAgent.instance) {
      this.httpLibrary = axios.create({
        baseURL: this.url,
      });
      HTTPAgent.instance = this;
    }
    return HTTPAgent.instance;
  }

  // set diffident header
  static setHeaders(headers) {
    this.httpLibrary.defaults.headers.common = headers;
  }

  static delay(fn, ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(fn())
      }, ms);
    })
  }

  _request(request, retry = 3) {
    
    return request()
      .then((res) => {
        if (!res.data) {
          if (retry <= 0) return { success: false };
          return this.delay(_request(request, retry - 1), (4 - retry) * 500)
        }

        return {
          success: res.data.success,
          result: res.data.result
        };
      })
      .catch((e) => {
        if (retry <= 0) return { success: false };
        return this.delay(_request(request, retry - 1), (4 - retry) * 500)
      })
  }

  setSignatureHeader({ path, secret, apiKey }) {
    const timestamp = new Date().getTime().toString()
    const signature = Utils.sign({
      apiMethod: 'GET',
      apiPath: path, 
      timestamp,
      secret
    })
    const headers = {
      'FTX-KEY': apiKey,
      'FTX-SIGN': signature,
      'FTX-TS': timestamp,
    }
    this.setHeaders(headers)
  }

  get({ path, secret, apiKey }) {
    this.setSignatureHeader({ path, secret, apiKey })
    return this._request(() => this.httpLibrary.get(path));
  }

  post({ path, headers, body }) {
    return this._request(() => this.httpLibrary.post(path, body));
  }

  delete({ path, headers, body  }) {
    return this._request(() => this.httpLibrary.delete(path, body));
  }

  put({ path, headers, body  }) {
    return this._request(() => this.httpLibrary.put(path, body));
  }

}

module.exports = HTTPAgent;
