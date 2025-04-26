require('dotenv').config();

module.exports = {
    // WebSocket配置
    WS_URL: 'wss://ws.okx.com:8443/ws/v5/business',
    SYMBOL: 'BTC-USDT',
    TIMEFRAME: '5m',

    // API配置
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.API_SECRET,
    PASSPHRASE: process.env.PASSPHRASE,

    // 交易参数
    POSITION_SIZE: 400,          // 每次开仓金额
    MAX_POSITIONS: 50,           // 最大持仓数量
    PRICE_CHANGE_THRESHOLD: 0.01, // 1%的价格变动阈值
    STOP_LOSS_THRESHOLD: 0.9,    // 止损阈值，价格低于均价的90%时止损
    TRADE_FEE_RATE: 0.0005      // 交易手续费率，0.05%
}; 