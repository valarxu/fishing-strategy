const config = require('./config');

// 创建交易策略实例
const createTradingStrategy = () => {
    let positions = [];
    let currentPositions = 0;
    let markPrice = 0;
    let limitOrders = [];
    let initialized = false;

    // 更新标记价格和订单
    const updatePrices = (closePrice) => {
        // 只有在没有持仓且价格上涨时更新标记价格
        if (currentPositions === 0 && closePrice > markPrice) {
            markPrice = closePrice;
            return true;
        }
        return false;
    };

    // 更新限价单
    const updateLimitOrders = (newPrice) => {
        limitOrders = [];
        // 创建网格订单
        for (let i = 0; i < config.GRID_COUNT; i++) {
            const gridPrice = newPrice * (1 - config.GRID_SPACING * (i + 1));
            limitOrders.push({
                buyPrice: gridPrice,
                expectedSellPrice: gridPrice * (1 + config.GRID_PROFIT_RATIO),
                timestamp: Date.now()
            });
        }
        initialized = true;
        markPrice = newPrice;
    };

    // 添加新的限价单（在最低价格下方）
    const addNewLimitOrder = () => {
        if (limitOrders.length === 0) return;
        
        const lowestOrder = limitOrders.reduce((min, order) => 
            order.buyPrice < min.buyPrice ? order : min
        );
        
        const newBuyPrice = lowestOrder.buyPrice * (1 - config.GRID_SPACING);
        limitOrders.push({
            buyPrice: newBuyPrice,
            expectedSellPrice: newBuyPrice * (1 + config.GRID_PROFIT_RATIO),
            timestamp: Date.now()
        });
    };

    // 添加平仓后的新订单
    const addOrderAfterClose = (closePrice) => {
        const newBuyPrice = closePrice * (1 - config.GRID_SPACING);
        limitOrders.push({
            buyPrice: newBuyPrice,
            expectedSellPrice: newBuyPrice * (1 + config.GRID_PROFIT_RATIO),
            timestamp: Date.now()
        });
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

    // 平仓
    const closePosition = (index) => {
        const position = positions[index];
        positions.splice(index, 1);
        currentPositions--;
        return position;
    };

    // 获取最低挂单价
    const getLowestOrderPrice = () => {
        if (limitOrders.length === 0) return null;
        return Math.min(...limitOrders.map(order => order.buyPrice));
    };

    return {
        positions,
        currentPositions,
        limitOrders,
        updatePrices,
        shouldClosePositions,
        closePosition,
        getLowestOrderPrice,
        updateLimitOrders,
        addNewLimitOrder,
        addOrderAfterClose
    };
};

module.exports = createTradingStrategy; 