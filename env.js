
  const env = {
    development: {"protocol":"postgres","host":"127.0.0.1","port":"5432","user":"postgres","password":"test","dbName":"ftx_bot","logging":false,"autoReconnect":true,"ormEnable":true,"dialectOptions":{"connectTimeout":3000},"pool":{"max":100},"dialect":"postgres","username":"postgres","database":"ftx_bot"},
  };
  
  module.exports = env;
  