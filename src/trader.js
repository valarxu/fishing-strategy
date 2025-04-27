const ccxt = require('ccxt');
const config = require('./config');
const notifier = require('./notifier');
const fs = require('fs').promises;
const path = require('path');

class Trader {
    constructor() {
        if (!config.IS_SIMULATION) {
            this.exchange = new ccxt.okx({
                apiKey: config.API_KEY,
                secret: config.API_SECRET,
                password: config.PASSPHRASE
            });
        }
        this.simulationLogFile = path.join(__dirname, '../logs/simulation.json');
    }

    async logSimulatedTrade(type, data) {
        try {
            let logs = [];
            try {
                const content = await fs.readFile(this.simulationLogFile, 'utf8');
                logs = JSON.parse(content);
            } catch (error) {
                // 如果文件不存在或为空，使用空数组
            }

            logs.push({
                timestamp: new Date().toISOString(),
                type,
                ...data
            });

            await fs.mkdir(path.dirname(this.simulationLogFile), { recursive: true });
            await fs.writeFile(this.simulationLogFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('记录模拟交易失败:', error);
        }
    }

    async openPosition(price) {
        try {
            const amount = config.POSITION_SIZE / price;
            const position = {
                symbol: config.SYMBOL,
                type: 'buy',
                amount: amount,
                price: price,
                cost: config.POSITION_SIZE,
                timestamp: Date.now()
            };

            if (config.IS_SIMULATION) {
                await this.logSimulatedTrade('open', position);
                console.log('模拟开仓成功:', position);
                await notifier.notifyOpenPosition({
                    buyPrice: price,
                    amount: amount,
                    size: config.POSITION_SIZE
                });
                return position;
            } else {
                const order = await this.exchange.createOrder(
                    config.SYMBOL,
                    'limit',
                    'buy',
                    amount,
                    price
                );
                console.log('实盘开仓成功:', order);
                await notifier.notifyOpenPosition({
                    buyPrice: price,
                    amount: amount,
                    size: config.POSITION_SIZE
                });
                return order;
            }
        } catch (error) {
            console.error('开仓失败:', error);
            throw error;
        }
    }

    async closePosition(price, amount) {
        try {
            const position = {
                symbol: config.SYMBOL,
                type: 'sell',
                amount: amount,
                price: price,
                cost: amount * price,
                timestamp: Date.now()
            };

            if (config.IS_SIMULATION) {
                await this.logSimulatedTrade('close', position);
                console.log('模拟平仓成功:', position);
                const profit = (price - position.price) * amount;
                await notifier.notifyClosePosition({
                    buyPrice: position.price,
                    amount: amount
                }, price, profit);
                return position;
            } else {
                const order = await this.exchange.createOrder(
                    config.SYMBOL,
                    'limit',
                    'sell',
                    amount,
                    price
                );
                console.log('实盘平仓成功:', order);
                const profit = (price - position.price) * amount;
                await notifier.notifyClosePosition({
                    buyPrice: position.price,
                    amount: amount
                }, price, profit);
                return order;
            }
        } catch (error) {
            console.error('平仓失败:', error);
            throw error;
        }
    }

    async stopLoss(positions, currentPrice) {
        try {
            const orders = [];
            for (const position of positions) {
                const amount = position.amount || (config.POSITION_SIZE / position.buyPrice);
                if (config.IS_SIMULATION) {
                    const simulatedOrder = {
                        symbol: config.SYMBOL,
                        type: 'sell',
                        amount: amount,
                        price: currentPrice,
                        cost: amount * currentPrice,
                        timestamp: Date.now()
                    };
                    await this.logSimulatedTrade('stopLoss', simulatedOrder);
                    orders.push(simulatedOrder);
                } else {
                    const order = await this.exchange.createOrder(
                        config.SYMBOL,
                        'market',
                        'sell',
                        amount,
                        currentPrice
                    );
                    orders.push(order);
                }
                const profit = (currentPrice - position.buyPrice) * amount;
                await notifier.notifyClosePosition(position, currentPrice, profit);
            }
            console.log(`${config.IS_SIMULATION ? '模拟' : '实盘'}止损完成:`, orders);
            return orders;
        } catch (error) {
            console.error('止损失败:', error);
            throw error;
        }
    }
}

module.exports = Trader; 