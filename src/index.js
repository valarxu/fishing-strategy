const WebSocketClient = require('./websocketClient');
const TradingStrategy = require('./strategy');
const PositionManager = require('./positionManager');
const Trader = require('./trader');
const notifier = require('./notifier');

// 创建交易机器人实例
const createTradingBot = () => {
    const strategy = new TradingStrategy();
    const positionManager = new PositionManager();
    const trader = new Trader();
    let initialPrice = null;

    // 通知持仓状态
    const notifyPositionStatus = async () => {
        await notifier.notifyPositionStatus(strategy.positions);
    };

    // 处理K线数据
    const handleKlineClose = async (kline) => {
        try {
            console.log('收到5分钟K线:', kline);

            // 更新价格
            strategy.updatePrices(kline.close);

            // 如果是首次收到价格且没有仓位，准备批量开仓
            if (!initialPrice && strategy.currentPositions === 0) {
                initialPrice = kline.close;
                const batchOrders = strategy.initializeBatchOrders(kline.close);
                console.log('准备批量开仓，初始价格:', kline.close);
                
                // 提交所有开仓订单
                for (const order of batchOrders) {
                    const result = await trader.openPosition(order.buyPrice);
                    const position = strategy.openPosition(kline);
                    position.orderId = result.id;
                    await positionManager.addPosition(position);
                }
                await notifyPositionStatus();
                return;
            }

            // 检查是否需要止损
            const stopLossSignal = strategy.shouldStopLoss(kline);
            if (stopLossSignal) {
                console.log('触发止损信号:', stopLossSignal);
                const positions = strategy.clearAllPositions();
                await trader.stopLoss(positions, kline.close);
                await positionManager.clearPositions();
                await notifyPositionStatus();
                return;
            }

            // 检查是否满足平仓条件
            const positionsToClose = strategy.shouldClosePositions(kline);
            if (positionsToClose.length > 0) {
                for (const { index, position } of positionsToClose) {
                    console.log('准备平仓:', position);
                    const amount = position.amount || (position.size / position.buyPrice);
                    await trader.closePosition(kline.close, amount);
                    strategy.closePosition(index);
                    await positionManager.removePosition(index);
                }
                await notifyPositionStatus();
            }
        } catch (error) {
            console.error('处理K线数据时出错:', error);
        }
    };

    // 初始化WebSocket客户端
    const wsClient = new WebSocketClient(handleKlineClose);

    // 初始化函数
    const initialize = async () => {
        try {
            // 加载保存的仓位
            const savedPositions = await positionManager.loadPositions();
            if (savedPositions.length > 0) {
                strategy.positions = savedPositions;
                strategy.currentPositions = savedPositions.length;
                console.log('已加载保存的仓位:', savedPositions);
                // 初始化时推送一次持仓状态
                await notifyPositionStatus();
            }

            // 连接WebSocket
            wsClient.connect();
        } catch (error) {
            console.error('初始化失败:', error);
            process.exit(1);
        }
    };

    return {
        initialize,
        wsClient
    };
};

// 启动程序
const bot = createTradingBot();
bot.initialize().catch(console.error);

// 优雅退出
process.on('SIGINT', async () => {
    console.log('正在关闭程序...');
    bot.wsClient.close();
    process.exit(0);
});