require('dotenv').config();

module.exports = {
    // WebSocket配置
    WS_URL: 'wss://ws.okx.com:8443/ws/v5/public',
    SYMBOL: 'BTC/USDT',
    TIMEFRAME: '5m',

    // API配置
    API_KEY: process.env.API_KEY || '',
    API_SECRET: process.env.API_SECRET || '',
    PASSPHRASE: process.env.PASSPHRASE || '',

    // 交易参数
    POSITION_SIZE: 100,          // 每个网格的交易金额
    MAX_POSITIONS: 100,           // 最大持仓数量
    PRICE_CHANGE_THRESHOLD: 0.005, // 1%的价格变动阈值
    STOP_LOSS_THRESHOLD: 0.9,    // 止损阈值，价格低于均价的90%时止损
    TRADE_FEE_RATE: 0.0005,     // 交易手续费率，0.05%

    // 模拟交易配置
    IS_SIMULATION: true,         // 是否为模拟交易模式

    // Telegram配置
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,

    // 网格策略配置
    GRID_SPACING: 0.005,  // 网格间距 0.5%
    GRID_PROFIT_RATIO: 0.005,  // 网格利润率 0.5%
    GRID_COUNT: 5,  // 网格数量

    // K线间隔
    KLINE_INTERVAL: '5m'
}; 