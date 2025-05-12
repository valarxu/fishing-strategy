const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

// 创建通知器实例
const createNotifier = () => {
    let bot = null;

    // 初始化Telegram机器人
    if (config.TELEGRAM_BOT_TOKEN) {
        bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: false });
    }

    // 发送消息
    const sendMessage = async (message) => {
        if (!bot || !config.TELEGRAM_CHAT_ID) {
            console.log('Telegram通知:', message);
            return;
        }

        try {
            await bot.sendMessage(config.TELEGRAM_CHAT_ID, message);
        } catch (error) {
            console.error('发送Telegram消息失败:', error);
        }
    };

    // 通知开仓
    const notifyOpenPosition = async (position) => {
        const message = `🟢 开仓通知\n` +
            `交易对: ${config.BTC_USDT_SWAP.instId}\n` +
            `开仓价格: ${position.buyPrice}\n` +
            `开仓数量: ${position.amount}\n` +
            `开仓金额: ${position.size} USDT\n` +
            `${config.IS_SIMULATION ? '【模拟交易】' : '【实盘交易】'}`;
        
        await sendMessage(message);
    };

    // 通知平仓
    const notifyClosePosition = async (position, closePrice, profit) => {
        const message = `🔴 平仓通知\n` +
            `交易对: ${config.BTC_USDT_SWAP.instId}\n` +
            `开仓价格: ${position.buyPrice}\n` +
            `平仓价格: ${closePrice}\n` +
            `交易数量: ${position.amount}\n` +
            `盈亏: ${profit.toFixed(2)} USDT\n` +
            `${config.IS_SIMULATION ? '【模拟交易】' : '【实盘交易】'}`;

        await sendMessage(message);
    };

    // 通知持仓状态
    const notifyPositionStatus = async (positions) => {
        if (!positions.length) {
            await sendMessage('📊 当前无持仓');
            return;
        }

        let message = '📊 当前持仓状态：\n\n';
        positions.forEach((pos, index) => {
            message += `${index + 1}. ${config.BTC_USDT_SWAP.instId} | 开仓价：${pos.buyPrice} | 预期平仓价：${pos.expectedSellPrice}\n` +
                `时间：${new Date(pos.timestamp).toLocaleString()}\n`;
        });
        message += `${config.IS_SIMULATION ? '【模拟交易】' : '【实盘交易】'}`;

        await sendMessage(message);
    };

    return {
        notifyOpenPosition,
        notifyClosePosition,
        notifyPositionStatus
    };
};

module.exports = createNotifier(); 