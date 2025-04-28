const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

class Notifier {
    constructor() {
        if (config.TELEGRAM_BOT_TOKEN && config.TELEGRAM_CHAT_ID) {
            this.bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: false });
            this.chatId = config.TELEGRAM_CHAT_ID;
        }
    }

    async sendMessage(message) {
        if (this.bot && this.chatId) {
            try {
                await this.bot.sendMessage(this.chatId, message);
            } catch (error) {
                console.error('发送Telegram消息失败:', error);
            }
        }
    }

    async notifyOpenPosition(position) {
        const message = `🟢 开仓通知\n` +
            `交易对: ${config.SYMBOL}\n` +
            `开仓价格: ${position.buyPrice}\n` +
            `开仓数量: ${position.amount}\n` +
            `开仓金额: ${position.size} USDT\n` +
            `${config.IS_SIMULATION ? '【模拟交易】' : '【实盘交易】'}`;
        
        await this.sendMessage(message);
    }

    async notifyClosePosition(position, closePrice, profit) {
        const message = `🔴 平仓通知\n` +
            `交易对: ${config.SYMBOL}\n` +
            `开仓价格: ${position.buyPrice}\n` +
            `平仓价格: ${closePrice}\n` +
            `交易数量: ${position.amount}\n` +
            `盈亏: ${profit.toFixed(2)} USDT\n` +
            `${config.IS_SIMULATION ? '【模拟交易】' : '【实盘交易】'}`;

        await this.sendMessage(message);
    }

    async notifyPositionStatus(positions) {
        if (!positions.length) {
            await this.sendMessage('📊 当前无持仓');
            return;
        }

        let message = '📊 当前持仓状态：\n\n';
        positions.forEach((pos, index) => {
            message += `${index + 1}. ${config.SYMBOL.replace('-USDT', '')} | 开仓价：${pos.buyPrice} | 预期平仓价：${pos.expectedSellPrice}\n` +
                `时间：${new Date(pos.timestamp).toLocaleString()}\n`;
        });
        message += `${config.IS_SIMULATION ? '【模拟交易】' : '【实盘交易】'}`;

        await this.sendMessage(message);
    }
}

module.exports = new Notifier(); 