const WebSocket = require('ws');
const config = require('./config');

class WebSocketClient {
    constructor(onKlineClose) {
        this.ws = null;
        this.onKlineClose = onKlineClose;
    }

    connect() {
        this.ws = new WebSocket(config.WS_URL);

        this.ws.on('open', () => {
            console.log('已连接到 OKX WebSocket 服务器');
            this.subscribe();
        });

        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                if (message.arg && message.arg.channel === 'candle5m' && message.data) {
                    const kline = message.data[0];
                    const klineTimestamp = parseInt(kline[0], 10);
                    const currentTime = Date.now();

                    // 判断当前时间是否超过 K 线时间戳加上 5 分钟
                    if (currentTime >= klineTimestamp + 300000) {
                        const formattedKline = {
                            timestamp: klineTimestamp,
                            open: parseFloat(kline[1]),
                            high: parseFloat(kline[2]),
                            low: parseFloat(kline[3]),
                            close: parseFloat(kline[4]),
                            volume: parseFloat(kline[5])
                        };
                        this.onKlineClose(formattedKline);
                    }
                }
            } catch (error) {
                console.error('解析数据时出错：', error);
            }
        });

        this.ws.on('error', (error) => {
            console.error('WebSocket 错误：', error);
        });

        this.ws.on('close', () => {
            console.log('连接已关闭，尝试重新连接...');
            setTimeout(() => this.connect(), 5000);
        });
    }

    subscribe() {
        const subscribeMessage = {
            op: 'subscribe',
            args: [{
                channel: 'candle5m',
                instId: config.SYMBOL,
                instType: 'SPOT'
            }]
        };
        this.ws.send(JSON.stringify(subscribeMessage));
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

module.exports = WebSocketClient; 