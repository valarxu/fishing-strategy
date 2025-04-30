const config = require('./config');

class TradingStrategy {
    constructor() {
        this.positions = [];
        this.currentPositions = 0;
        this.markPrice = 0;
        this.initialized = false;
    }

    // 初始化批量开仓
    initializeBatchOrders(initialPrice) {
        if (this.initialized) return;
        
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
        
        this.initialized = true;
        return orders;
    }

    // 更新标记价格
    updatePrices(closePrice) {
        this.markPrice = closePrice;
    }

    // 检查是否满足开仓条件
    shouldOpenPosition(kline) {
        return !this.initialized && this.currentPositions === 0;
    }

    // 检查是否满足平仓条件
    shouldClosePositions(kline) {
        const positionsToClose = [];
        
        for (let i = 0; i < this.positions.length; i++) {
            const position = this.positions[i];
            if (kline.close >= position.expectedSellPrice) {
                positionsToClose.push({
                    index: i,
                    position: position
                });
            }
        }

        return positionsToClose;
    }

    // 检查是否需要止损
    shouldStopLoss(kline) {
        if (this.currentPositions > 0) {
            const totalBuyPrice = this.positions.reduce((sum, pos) => sum + pos.buyPrice, 0);
            const averagePrice = totalBuyPrice / this.positions.length;

            if (kline.close < averagePrice * config.STOP_LOSS_THRESHOLD) {
                return {
                    averagePrice,
                    currentPrice: kline.close
                };
            }
        }
        return null;
    }

    // 开仓
    openPosition(kline) {
        const position = {
            buyPrice: kline.close,
            expectedSellPrice: kline.close * (1 + config.PRICE_CHANGE_THRESHOLD),
            timestamp: kline.timestamp
        };

        this.positions.push(position);
        this.currentPositions++;
        return position;
    }

    // 平仓
    closePosition(index) {
        const position = this.positions[index];
        this.positions.splice(index, 1);
        this.currentPositions--;
        return position;
    }

    // 清空所有仓位（用于止损）
    clearAllPositions() {
        const closedPositions = [...this.positions];
        this.positions = [];
        this.currentPositions = 0;
        return closedPositions;
    }
}

module.exports = TradingStrategy; 