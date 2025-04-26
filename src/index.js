const WebSocketClient = require('./websocketClient');
const TradingStrategy = require('./strategy');
const PositionManager = require('./positionManager');
const Trader = require('./trader');

class TradingBot {
    constructor() {
        this.strategy = new TradingStrategy();
        this.positionManager = new PositionManager();
        this.trader = new Trader();
        this.wsClient = new WebSocketClient(this.handleKlineClose.bind(this));
    }

    async initialize() {
        try {
            // 加载保存的仓位
            const savedPositions = await this.positionManager.loadPositions();
            if (savedPositions.length > 0) {
                this.strategy.positions = savedPositions;
                this.strategy.currentPositions = savedPositions.length;
                console.log('已加载保存的仓位:', savedPositions);
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

            // 检查是否需要止损
            const stopLossSignal = this.strategy.shouldStopLoss(kline);
            if (stopLossSignal) {
                console.log('触发止损信号:', stopLossSignal);
                const positions = this.strategy.clearAllPositions();
                await this.trader.stopLoss(positions, kline.close);
                await this.positionManager.clearPositions();
                return;
            }

            // 检查是否满足平仓条件
            const positionsToClose = this.strategy.shouldClosePositions(kline);
            for (const { index, position } of positionsToClose) {
                console.log('准备平仓:', position);
                const amount = position.amount || (position.size / position.buyPrice);
                await this.trader.closePosition(kline.close, amount);
                this.strategy.closePosition(index);
                await this.positionManager.removePosition(index);
            }

            // 检查是否满足开仓条件
            if (this.strategy.shouldOpenPosition(kline)) {
                console.log('准备开仓，当前价格:', kline.close);
                const order = await this.trader.openPosition(kline.close);
                const position = this.strategy.openPosition(kline);
                position.orderId = order.id;
                await this.positionManager.addPosition(position);
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