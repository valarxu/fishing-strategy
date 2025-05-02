# 自动交易策略

这是一个基于OKX交易所的自动交易策略程序。程序使用WebSocket实时接收5分钟K线数据，并根据预设策略执行交易操作。支持Telegram通知功能。

## 功能特点

- 实时监控5分钟K线数据
- 自动执行开仓、平仓操作
- 支持止损机制
- 本地保存仓位信息
- 模块化设计，代码结构清晰
- Telegram实时通知交易状态
- 支持回测功能

## 项目结构

```
├── src/
│   ├── index.js          # 主程序入口
│   ├── config.js         # 配置文件
│   ├── websocketClient.js # WebSocket客户端
│   ├── strategy.js       # 交易策略
│   ├── trader.js         # 交易执行
│   ├── positionManager.js # 仓位管理
│   └── notifier.js       # Telegram通知模块
├── backtest.js           # 回测模块
├── websocket.js          # WebSocket测试模块
├── .env                  # 环境变量配置
└── package.json          # 项目依赖
```

## 安装

1. 克隆项目：
```bash
git clone [repository_url]
cd fishing-strategy
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
cp .env.example .env
```
编辑 `.env` 文件，填入您的配置信息：
```
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here
PASSPHRASE=your_passphrase_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

## 运行

启动程序：
```bash
npm start
```

运行回测：
```bash
node backtest.js
```

## 交易策略说明

1. 开仓条件：
   - 当前价格低于标记价格的预设阈值
   - 当前持仓数量未达到最大限制
   - 满足技术指标条件

2. 平仓条件：
   - 当前价格高于开仓价格的预设阈值
   - 达到止损条件
   - 满足技术指标条件

3. 止损条件：
   - 当持仓达到最大数量时
   - 当前价格低于所有持仓均价的预设阈值
   - 满足技术指标条件

## 注意事项

- 请确保您的OKX API密钥具有适当的权限
- 建议先在测试环境中验证策略
- 请根据您的风险承受能力调整配置参数
- 确保正确配置Telegram通知参数
- 回测结果仅供参考，实际交易结果可能有所不同

## 许可证

MIT 