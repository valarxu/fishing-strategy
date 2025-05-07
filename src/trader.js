const ccxt = require('ccxt');
const config = require('./config');
const notifier = require('./notifier');

// 创建交易者实例
const createTrader = () => {
    const exchange = new ccxt.okx({
        apiKey: config.API_KEY,
        secret: config.API_SECRET,
        password: config.PASSPHRASE
    });

    // 获取未成交订单
    const getOpenOrders = async () => {
        try {
            const orders = await exchange.fetchOpenOrders(config.SYMBOL);
            return orders;
        } catch (error) {
            console.error('获取未成交订单失败:', error);
            throw error;
        }
    };

    // 平仓
    const closePosition = async (price, amount) => {
        try {
            const order = await exchange.createOrder(
                config.SYMBOL,
                'limit',
                'sell',
                amount,
                price
            );
            console.log('平仓成功:', order);
            const profit = (price - order.price) * amount;
            await notifier.notifyClosePosition({
                buyPrice: order.price,
                amount: amount
            }, price, profit);
            return order;
        } catch (error) {
            console.error('平仓失败:', error);
            throw error;
        }
    };

    // 取消所有订单
    const cancelAllOrders = async () => {
        try {
            const orders = await exchange.fetchOpenOrders(config.SYMBOL);
            for (const order of orders) {
                await exchange.cancelOrder(order.id, config.SYMBOL);
            }
            console.log('已取消所有订单');
        } catch (error) {
            console.error('取消订单失败:', error);
            throw error;
        }
    };

    // 放置限价单
    const placeLimitOrder = async (price) => {
        try {
            const amount = config.POSITION_SIZE / price;
            const order = await exchange.createOrder(
                config.SYMBOL,
                'limit',
                'buy',
                amount,
                price
            );
            console.log('放置限价单成功:', order);
            return order;
        } catch (error) {
            console.error('放置限价单失败:', error);
            throw error;
        }
    };

    return {
        getOpenOrders,
        closePosition,
        cancelAllOrders,
        placeLimitOrder
    };
};

module.exports = createTrader; 