const WebSocketClient = require('./websocketClient');
const TradingStrategy = require('./strategy');
const PositionManager = require('./positionManager');
const Trader = require('./trader');
const notifier = require('./notifier');

class TradingBot {
    constructor() {
        this.strategy = new TradingStrategy();
        this.positionManager = new PositionManager();
        this.trader = new Trader();
        this.wsClient = new WebSocketClient(this.handleKlineClose.bind(this));
        this.initialPrice = null;
    }

    async notifyPositionStatus() {
        await notifier.notifyPositionStatus(this.strategy.positions);
    }

    async initialize() {
        try {
            // 加载保存的仓位
            const savedPositions = await this.positionManager.loadPositions();
            if (savedPositions.length > 0) {
                this.strategy.positions = savedPositions;
                this.strategy.currentPositions = savedPositions.length;
                console.log('已加载保存的仓位:', savedPositions);
                // 初始化时推送一次持仓状态
                await this.notifyPositionStatus();
            }

            // 连接WebSocket
            this.wsClient.connect();
        } catch (error) {
            console.error('初始化失败:', error);
            process.exit(1);
        }
    }

    async handleKlineClose(kline) {
        try {
            console.log('收到5分钟K线:', kline);

            // 更新价格
            this.strategy.updatePrices(kline.close);

            // 如果是首次收到价格且没有仓位，准备批量开仓
            if (!this.initialPrice && this.strategy.currentPositions === 0) {
                this.initialPrice = kline.close;
                const batchOrders = this.strategy.initializeBatchOrders(kline.close);
                console.log('准备批量开仓，初始价格:', kline.close);
                
                // 提交所有开仓订单
                for (const order of batchOrders) {
                    const result = await this.trader.openPosition(order.buyPrice);
                    const position = this.strategy.openPosition(kline);
                    position.orderId = result.id;
                    await this.positionManager.addPosition(position);
                }
                await this.notifyPositionStatus();
                return;
            }

            // 检查是否需要止损
            const stopLossSignal = this.strategy.shouldStopLoss(kline);
            if (stopLossSignal) {
                console.log('触发止损信号:', stopLossSignal);
                const positions = this.strategy.clearAllPositions();
                await this.trader.stopLoss(positions, kline.close);
                await this.positionManager.clearPositions();
                await this.notifyPositionStatus();
                return;
            }

            // 检查是否满足平仓条件
            const positionsToClose = this.strategy.shouldClosePositions(kline);
            if (positionsToClose.length > 0) {
                for (const { index, position } of positionsToClose) {
                    console.log('准备平仓:', position);
                    const amount = position.amount || (position.size / position.buyPrice);
                    await this.trader.closePosition(kline.close, amount);
                    this.strategy.closePosition(index);
                    await this.positionManager.removePosition(index);
                }
                await this.notifyPositionStatus();
            }
        } catch (error) {
            console.error('处理K线数据时出错:', error);
        }
    }
}

// 启动程序
const bot = new TradingBot();
bot.initialize().catch(console.error);

// 优雅退出
process.on('SIGINT', async () => {
    console.log('正在关闭程序...');
    bot.wsClient.close();
    process.exit(0);
});