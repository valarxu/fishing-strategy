import WebSocket from 'ws';

// OKX WebSocket API 地址
const wsUrl = 'wss://ws.okx.com:8443/ws/v5/public';

// 创建 WebSocket 连接
const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
    console.log('已连接到 OKX WebSocket 服务器');
    
    // 订阅 BTC-USDT 1小时 K线数据
    const subscribeMessage = {
        op: 'subscribe',
        args: [{
            channel: 'candle1H',
            instId: 'BTC-USDT'
        }]
    };
    
    ws.send(JSON.stringify(subscribeMessage));
});

ws.on('message', function incoming(data) {
    try {
        const message = JSON.parse(data);
        console.log('收到数据：', JSON.stringify(message, null, 2));
    } catch (error) {
        console.error('解析数据时出错：', error);
    }
});

ws.on('error', function error(err) {
    console.error('WebSocket 错误：', err);
});

ws.on('close', function close() {
    console.log('连接已关闭');
}); 