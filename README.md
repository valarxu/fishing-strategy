# OKX BTC 1小时K线数据订阅示例

这是一个简单的 Node.js 程序，用于通过 WebSocket 获取 OKX 交易所的 BTC-USDT 1小时K线数据。

## 安装依赖

```bash
npm install
```

## 运行程序

```bash
node index.js
```

## 功能说明

- 自动连接到 OKX WebSocket API
- 订阅 BTC-USDT 1小时K线数据
- 实时打印接收到的数据

## 数据格式说明

接收到的K线数据格式示例：
```json
{
  "arg": {
    "channel": "candle1H",
    "instId": "BTC-USDT"
  },
  "data": [
    [
      "1697788800000",  // 开始时间戳
      "29789.9",        // 开盘价
      "29830.1",        // 最高价
      "29751.1",        // 最低价
      "29776.9",        // 收盘价
      "1866.87786489",  // 交易量
      "55575324.374"    // 交易额
    ]
  ]
}
``` 