const axios = require("axios");

class HTTPAgent {
  static instance;

  constructor({ apiURL = '' } = {}) {
    // default ftx api
    this.url = apiURL || 'https://ftx.com/api'
    if (!HTTPAgent.instance) {
      this.httpLibrary = axios.create({
        baseURL: this.url,
      });
      HTTPAgent.instance = this;
    }
    return HTTPAgent.instance;
  }

  setHeaders(headers) {
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

  get({ headers, path }) {
    this.setHeaders(headers)
    return this._request(() => this.httpLibrary.get(path));
  }

  post({ headers, path, body }) {
    this.setHeaders(headers)
    return this._request(() => this.httpLibrary.post(path, body));
  }

  delete({ headers, path, body }) {
    this.setHeaders(headers)
    return this._request(() => this.httpLibrary.delete(path, body));
  }

  put({ headers, path, body }) {
    this.setHeaders(headers)
    return this._request(() => this.httpLibrary.put(path, body));
  }

}

module.exports = HTTPAgent;
