const config = require('./config');

class TradingStrategy {
    constructor() {
        this.positions = [];
        this.currentPositions = 0;
        this.markPrice = 0;
        this.expectedBuyPrice = 0;
    }

    // 更新标记价格和预期开仓价格
    updatePrices(closePrice) {
        if (this.currentPositions === 0 && closePrice > this.markPrice) {
            this.markPrice = closePrice;
            this.expectedBuyPrice = closePrice * (1 - config.PRICE_CHANGE_THRESHOLD);
        }
    }

    // 检查是否满足开仓条件
    shouldOpenPosition(kline) {
        return kline.close <= this.expectedBuyPrice && 
               this.currentPositions < config.MAX_POSITIONS;
    }

    // 检查是否满足平仓条件
    shouldClosePositions(kline) {
        const positionsToClose = [];
        
        // 从后往前检查每个仓位
        for (let i = this.positions.length - 1; i >= 0; i--) {
            const position = this.positions[i];
            if (kline.close >= position.expectedSellPrice) {
                positionsToClose.push({
                    index: i,
                    position: position
                });
                break; // 一次只平一个仓位
            }
        }

        return positionsToClose;
    }

    // 检查是否需要止损
    shouldStopLoss(kline) {
        if (this.currentPositions === config.MAX_POSITIONS) {
            // 计算均价
            const totalBuyPrice = this.positions.reduce((sum, pos) => sum + pos.buyPrice, 0);
            const averagePrice = totalBuyPrice / this.positions.length;

            // 检查是否触发止损
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
        this.markPrice = kline.close;
        this.expectedBuyPrice = this.markPrice * (1 - config.PRICE_CHANGE_THRESHOLD);

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