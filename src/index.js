const WebSocketClient = require('./websocketClient');
const TradingStrategy = require('./strategy');
const PositionManager = require('./positionManager');
const Trader = require('./trader');
const notifier = require('./notifier');
const config = require('./config');

// 创建交易机器人实例
const createTradingBot = () => {
    const strategy = new TradingStrategy();
    const positionManager = new PositionManager();
    const trader = new Trader();

    // 通知持仓状态
    const notifyPositionStatus = async () => {
        await notifier.notifyPositionStatus(strategy.positions);
    };

    // 处理K线数据
    const handleKlineClose = async (kline) => {
        try {
            console.log('收到K线:', kline);

            // 更新价格并检查是否需要更新订单
            const shouldUpdateOrders = strategy.updatePrices(kline.close);
            
            // 如果价格上涨且没有持仓，更新订单
            if (shouldUpdateOrders) {
                console.log('价格上涨，更新限价单');
                await trader.cancelAllOrders(config.BTC_USDT_SWAP.instId);
                strategy.updateLimitOrders(kline.close);
                for (const order of strategy.limitOrders) {
                    await trader.placeLimitOrder(config.BTC_USDT_SWAP.instId, order.buyPrice, 'long');
                }
            }

            // 检查是否有仓位需要平仓
            const positionsToClose = strategy.shouldClosePositions(kline);
            if (positionsToClose.length > 0) {
                for (const { index, position } of positionsToClose) {
                    console.log('准备平仓:', position);
                    const amount = position.amount || (position.size / position.buyPrice);
                    await trader.closePosition(config.BTC_USDT_SWAP.instId, kline.close, amount, 'long');
                    strategy.closePosition(index);
                    await positionManager.removePosition(index);
                    
                    // 平仓后添加新的限价单
                    strategy.addOrderAfterClose(kline.close);
                    const newOrder = strategy.limitOrders[strategy.limitOrders.length - 1];
                    await trader.placeLimitOrder(config.BTC_USDT_SWAP.instId, newOrder.buyPrice, 'long');
                }
                await notifyPositionStatus();
            }

            // 检查是否有订单成交（开仓）
            const openOrders = await trader.getOpenOrders(config.BTC_USDT_SWAP.instId);
            if (openOrders.length < config.GRID_COUNT) {
                console.log('检测到订单成交，补充新订单');
                // 计算需要补充的订单数量
                const ordersToAdd = config.GRID_COUNT - openOrders.length;
                
                // 获取当前最低价格
                const lowestPrice = strategy.getLowestOrderPrice();
                if (lowestPrice) {
                    // 补充订单
                    for (let i = 0; i < ordersToAdd; i++) {
                        strategy.addNewLimitOrder();
                        const newOrder = strategy.limitOrders[strategy.limitOrders.length - 1];
                        await trader.placeLimitOrder(config.BTC_USDT_SWAP.instId, newOrder.buyPrice, 'long');
                    }
                }
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
                
                // 根据最低买入价设置新的限价单
                const lowestPrice = Math.min(...savedPositions.map(pos => pos.buyPrice));
                strategy.updateLimitOrders(lowestPrice);
                for (const order of strategy.limitOrders) {
                    await trader.placeLimitOrder(config.BTC_USDT_SWAP.instId, order.buyPrice, 'long');
                }
                
                // 初始化时推送一次持仓状态
                await notifyPositionStatus();
            } else {
                // 如果没有仓位，等待第一个K线数据来设置限价单
                console.log('没有找到保存的仓位，等待第一个K线数据...');
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