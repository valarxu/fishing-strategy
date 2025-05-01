const config = require('./config');

// 创建交易策略实例
const createTradingStrategy = () => {
    let positions = [];
    let currentPositions = 0;
    let markPrice = 0;
    let initialized = false;

    // 初始化批量开仓
    const initializeBatchOrders = (initialPrice) => {
        if (initialized) return [];
        
        const orders = [];
        let currentPrice = initialPrice;
        
        for (let i = 0; i < 100; i++) {
            orders.push({
                buyPrice: currentPrice,
                expectedSellPrice: currentPrice * (1 + config.PRICE_CHANGE_THRESHOLD),
                timestamp: Date.now()
            });
            currentPrice = currentPrice * (1 - 0.005); // 每个订单价格降低0.5%
        }
        
        initialized = true;
        return orders;
    };

    // 更新标记价格
    const updatePrices = (closePrice) => {
        markPrice = closePrice;
    };

    // 检查是否满足开仓条件
    const shouldOpenPosition = (kline) => {
        return !initialized && currentPositions === 0;
    };

    // 检查是否满足平仓条件
    const shouldClosePositions = (kline) => {
        const positionsToClose = [];
        
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            if (kline.close >= position.expectedSellPrice) {
                positionsToClose.push({
                    index: i,
                    position: position
                });
            }
        }

        return positionsToClose;
    };

    // 检查是否需要止损
    const shouldStopLoss = (kline) => {
        if (currentPositions > 0) {
            const totalBuyPrice = positions.reduce((sum, pos) => sum + pos.buyPrice, 0);
            const averagePrice = totalBuyPrice / positions.length;

            if (kline.close < averagePrice * config.STOP_LOSS_THRESHOLD) {
                return {
                    averagePrice,
                    currentPrice: kline.close
                };
            }
        }
        return null;
    };

    // 开仓
    const openPosition = (kline) => {
        const position = {
            buyPrice: kline.close,
            expectedSellPrice: kline.close * (1 + config.PRICE_CHANGE_THRESHOLD),
            timestamp: kline.timestamp
        };

        positions.push(position);
        currentPositions++;
        return position;
    };

    // 平仓
    const closePosition = (index) => {
        const position = positions[index];
        positions.splice(index, 1);
        currentPositions--;
        return position;
    };

    // 清空所有仓位（用于止损）
    const clearAllPositions = () => {
        const closedPositions = [...positions];
        positions = [];
        currentPositions = 0;
        return closedPositions;
    };

    return {
        positions,
        currentPositions,
        initializeBatchOrders,
        updatePrices,
        shouldOpenPosition,
        shouldClosePositions,
        shouldStopLoss,
        openPosition,
        closePosition,
        clearAllPositions
    };
};

module.exports = createTradingStrategy; 