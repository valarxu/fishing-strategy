const ccxt = require('ccxt');
const config = require('./config');
const notifier = require('./notifier');

// 获取合约信息
const getInstrumentInfo = (symbol) => {
    const instrumentMap = {
        'BTC-USDT-SWAP': config.BTC_USDT_SWAP,
        'ETH-USDT-SWAP': config.ETH_USDT_SWAP
    };
    return instrumentMap[symbol];
};

// 计算合约张数
const calculateContractSize = (instrumentInfo, currentPrice, positionUSDT) => {
    // 一张合约的价值 = 合约面值 * 当前价格
    const contractValue = parseFloat(instrumentInfo.ctVal) * currentPrice;
    
    // 需要的合约张数 = 预期仓位价值 / 每张合约价值
    let contractSize = positionUSDT / contractValue;
    
    // 确保合约张数符合最小变动单位
    const lotSize = parseFloat(instrumentInfo.lotSz);
    // 向下取整到最接近的lotSize的整数倍
    contractSize = Math.floor(contractSize / lotSize) * lotSize;
    
    // 确保合约张数符合最小交易量
    const minSize = parseFloat(instrumentInfo.minSz);
    if (contractSize < minSize) {
        contractSize = minSize;
    }
    
    // 格式化数字，避免浮点数精度问题
    return contractSize.toFixed(instrumentInfo.lotSz.split('.')[1].length);
};

// 创建交易者实例
const createTrader = () => {
    const exchange = new ccxt.okx({
        apiKey: config.API_KEY,
        secret: config.API_SECRET,
        password: config.PASSPHRASE
    });

    // 获取未成交订单
    const getOpenOrders = async (symbol = 'BTC-USDT-SWAP') => {
        try {
            const orders = await exchange.fetchOpenOrders(symbol);
            return orders;
        } catch (error) {
            console.error('获取未成交订单失败:', error);
            throw error;
        }
    };

    // 平仓
    const closePosition = async (symbol = 'BTC-USDT-SWAP', price, amount, posSide = 'long') => {
        try {
            const order = await exchange.createOrder(
                symbol,
                'limit',
                posSide === 'long' ? 'sell' : 'buy',
                amount,
                price,
                {
                    tdMode: 'isolated',
                    posSide: posSide
                }
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
    const cancelAllOrders = async (symbol = 'BTC-USDT-SWAP') => {
        try {
            const orders = await exchange.fetchOpenOrders(symbol);
            for (const order of orders) {
                await exchange.cancelOrder(order.id, symbol);
            }
            console.log('已取消所有订单');
        } catch (error) {
            console.error('取消订单失败:', error);
            throw error;
        }
    };

    // 放置限价单
    const placeLimitOrder = async (symbol = 'BTC-USDT-SWAP', price, posSide = 'long') => {
        try {
            const instrumentInfo = getInstrumentInfo(symbol);
            if (!instrumentInfo) {
                throw new Error('不支持的交易对');
            }

            const contractSize = calculateContractSize(instrumentInfo, price, config.POSITION_SIZE);
            
            console.log(`预期开仓价值: ${config.POSITION_SIZE} USDT`);
            console.log(`当前币价: ${price} USDT`);
            console.log(`计算得到合约张数: ${contractSize} 张`);
            console.log(`持仓方向: ${posSide}`);

            const order = await exchange.createOrder(
                symbol,
                'limit',
                posSide === 'long' ? 'buy' : 'sell',
                contractSize,
                price,
                {
                    tdMode: 'isolated',
                    posSide: posSide
                }
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