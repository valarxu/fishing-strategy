const ccxt = require('ccxt');
const config = require('./config');

class Trader {
    constructor() {
        this.exchange = new ccxt.okx({
            apiKey: config.API_KEY,
            secret: config.API_SECRET,
            password: config.PASSPHRASE
        });
    }

    async openPosition(price) {
        try {
            const order = await this.exchange.createOrder(
                config.SYMBOL,
                'limit',
                'buy',
                config.POSITION_SIZE / price,
                price
            );
            console.log('开仓成功:', order);
            return order;
        } catch (error) {
            console.error('开仓失败:', error);
            throw error;
        }
    }

    async closePosition(price, amount) {
        try {
            const order = await this.exchange.createOrder(
                config.SYMBOL,
                'limit',
                'sell',
                amount,
                price
            );
            console.log('平仓成功:', order);
            return order;
        } catch (error) {
            console.error('平仓失败:', error);
            throw error;
        }
    }

    async stopLoss(positions, currentPrice) {
        try {
            const orders = [];
            for (const position of positions) {
                const amount = config.POSITION_SIZE / position.buyPrice;
                const order = await this.exchange.createOrder(
                    config.SYMBOL,
                    'market',
                    'sell',
                    amount,
                    currentPrice
                );
                orders.push(order);
            }
            console.log('止损完成:', orders);
            return orders;
        } catch (error) {
            console.error('止损失败:', error);
            throw error;
        }
    }
}

module.exports = Trader; 