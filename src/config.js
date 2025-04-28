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
    MAX_POSITIONS: 100,           // 最大持仓数量
    PRICE_CHANGE_THRESHOLD: 0.005, // 1%的价格变动阈值
    STOP_LOSS_THRESHOLD: 0.9,    // 止损阈值，价格低于均价的90%时止损
    TRADE_FEE_RATE: 0.0005,     // 交易手续费率，0.05%

    // 模拟交易配置
    IS_SIMULATION: true,         // 是否为模拟交易模式

    // Telegram配置
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
}; 