const axios = require("axios");
const Utils = require('./Utils');

class HTTPAgent {
  static instance;

  constructor({ apiURL = '' } = {}) {
    this.url = apiURL || 'https://ftx.com/api'
    if (!HTTPAgent.instance) {
      this.httpLibrary = axios.create({
        baseURL: this.url,
      });
      HTTPAgent.instance = this;
    }
    return HTTPAgent.instance;
  }

  // set diffident header
  setHeaders(headers) {
    this.httpLibrary.defaults.headers.common = headers;
  }

  delay(fn, ms) {
    console.log('fc', fn);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(fn())
      }, ms);
    })
  }

  _request(request, retry = 0) {
    
    return request()
      .then(async(res) => {
        if (!res.data) {
          if (retry <= 0) return { success: false };
          return this.delay(this._request(request, retry - 1), (4 - retry) * 5000)
        }

        return {
          success: res.data.success,
          result: res.data.result
        };
      })
      .catch(async(e) => {
        console.log('e', e);
        if (retry <= 0) return { success: false };
        return this.delay(this._request(request, retry - 1), (4 - retry) * 5000)
      })
  }

  setSignatureHeader({ method, path, secret, apiKey, body, params }) {
    const timestamp = new Date().getTime().toString()
    const signature = Utils.sign({
      apiMethod: method,
      apiPath: path, 
      timestamp,
      secret,
      body,
      params
    })
    const headers = {
      'FTX-KEY': apiKey,
      'FTX-SIGN': signature,
      'FTX-TS': timestamp,
    }
    this.setHeaders(headers)
  }

  get({ path, secret, apiKey }) {
    this.setSignatureHeader({ method: 'GET', path, secret, apiKey })
    return this._request(() => this.httpLibrary.get(path));
  }

  post({ path, secret, apiKey, body }) {
    this.setSignatureHeader({ method: 'POST', path, secret, apiKey, body})
    return this._request(() => this.httpLibrary.post(path, body));
  }

  delete({ path, secret, apiKey, body  }) {
    this.setSignatureHeader({ method: 'DELETE', path, secret, apiKey })
    return this._request(() => this.httpLibrary.delete(path, body));
  }

  put({ path, secret, apiKey, body  }) {
    this.setSignatureHeader({ method: 'PUT', path, secret, apiKey })
    return this._request(() => this.httpLibrary.put(path, body));
  }

}

module.exports = HTTPAgent;
