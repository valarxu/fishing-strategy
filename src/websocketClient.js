const WebSocket = require('ws');
const config = require('./config');

// 创建WebSocket客户端实例
const createWebSocketClient = (onKlineClose) => {
    let ws = null;
    let lastKlineTimestamp = 0;

    // 检查是否是新的K线
    const isNewKline = (timestamp) => {
        // 如果是第一次收到数据
        if (lastKlineTimestamp === 0) {
            return true;
        }
        // 检查时间戳差值是否为5分钟（300000毫秒）
        return timestamp - lastKlineTimestamp >= 300000;
    };

    // 连接WebSocket
    const connect = () => {
        ws = new WebSocket(config.WS_URL);

        ws.on('open', () => {
            console.log('WebSocket连接已建立');
            subscribe();
        });

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                if (message.event === 'subscribe') {
                    console.log('订阅成功:', message);
                } else if (message.data) {
                    const timestamp = parseInt(message.data[0][0]);
                    
                    // 检查是否是新的K线
                    if (isNewKline(timestamp)) {
                        lastKlineTimestamp = timestamp;
                        const kline = {
                            timestamp: timestamp,
                            open: parseFloat(message.data[0][1]),
                            high: parseFloat(message.data[0][2]),
                            low: parseFloat(message.data[0][3]),
                            close: parseFloat(message.data[0][4]),
                            volume: parseFloat(message.data[0][5])
                        };
                        console.log('新的5分钟K线:', new Date(timestamp).toLocaleString());
                        onKlineClose(kline);
                    }
                }
            } catch (error) {
                console.error('处理WebSocket消息时出错:', error);
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket错误:', error);
        });

        ws.on('close', () => {
            console.log('WebSocket连接已关闭');
            // 尝试重新连接
            setTimeout(connect, 5000);
        });
    };

    // 订阅K线数据
    const subscribe = () => {
        const subscribeMessage = {
            op: 'subscribe',
            args: [{
                channel: 'candle5m',
                instId: config.SYMBOL,
                instType: 'SPOT'
            }]
        };
        ws.send(JSON.stringify(subscribeMessage));
    };

    // 关闭WebSocket连接
    const close = () => {
        if (ws) {
            ws.close();
        }
    };

    return {
        connect,
        close
    };
};

module.exports = createWebSocketClient; 