import WebSocket from 'ws';

// OKX WebSocket API 地址
const wsUrl = 'wss://ws.okx.com:8443/ws/v5/business';

// 创建 WebSocket 连接
const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
    console.log('已连接到 OKX WebSocket 服务器');

    // 订阅 BTC-USDT 5分钟 K线数据，注意加上 instType: 'SPOT'
    const subscribeMessage = {
        op: 'subscribe',
        args: [{
            channel: 'candle5m',
            instId: 'BTC-USDT',
            instType: 'SPOT'
        }]
    };
    
    ws.send(JSON.stringify(subscribeMessage));
});

ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
  
      if (message.arg && message.arg.channel === 'candle5m' && message.data) {
        const kline = message.data[0];
        const klineTimestamp = parseInt(kline[0], 10);
        const currentTime = Date.now();
  
        // 判断当前时间是否超过 K 线时间戳加上 5 分钟（300000 毫秒）
        if (currentTime >= klineTimestamp + 300000) {
          console.log('5 分钟 K 线已收盘：', kline);
          // 在此处执行您的交易策略
        }
      }
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
