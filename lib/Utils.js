const toml = require('toml');
const fs = require('fs');
const path = require('path');

const hmacSHA256 = require('crypto-js/hmac-sha256')

// const Hex = require('crypto-js/enc-hex')
// const sha256 = require('crypto-js/sha256')


class Utils {

  constructor(config) {
    this.config = config;
  }

  static readFile({ filePath }) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(data);
        }
      });
    });
  }

  static sign({ apiMethod, apiPath, body, params, secret, timestamp }) {
    const method = apiMethod.toUpperCase()
    let sign = timestamp + method

    switch (method) {
      case 'GET':
      case 'DELETE':
        if (!params) sign += `/api/${apiPath}`
        else sign += `/api/${apiPath}?${new URLSearchParams(params).toString()}`
        break;
      case 'POST':
      case 'PUT':
      case 'PATCH':
        sign += `/api/${apiPath}${JSON.stringify(body)}`
    }
    console.log('sign', sign);
    
    return hmacSHA256(sign, secret).toString()
  }

  static async readConfig() {
    let configFile = {}
    const privateConfigPath = path.resolve(__dirname, '../config.toml') ;
    const defaultConfigPath = path.resolve(__dirname, '../default.config.toml');
    try {
      configFile = await this.readFile({ filePath: privateConfigPath });
    } catch (e) {
      console.log('e:', e);
      configFile = await this.readFile({ filePath: defaultConfigPath });
    }

    return toml.parse(configFile);
  }

}

module.exports = Utils;