# 网格交易策略机器人

这是一个基于OKX交易所的网格交易策略机器人。程序使用WebSocket实时接收K线数据，并根据网格策略自动执行交易操作。支持Telegram通知功能和回测功能。

## 功能特点

- 实时监控K线数据（默认5分钟）
- 网格交易策略自动执行
- 支持多网格订单管理
- 自动补充网格订单
- 本地保存仓位信息
- 模块化设计，代码结构清晰
- Telegram实时通知交易状态
- 支持历史数据回测功能

## 项目结构

```
├── src/
│   ├── index.js          # 主程序入口
│   ├── config.js         # 配置文件
│   ├── websocketClient.js # WebSocket客户端
│   ├── strategy.js       # 网格交易策略
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

## 网格策略说明

1. 网格参数配置：
   - `GRID_SPACING`: 网格间距（默认0.5%）
   - `GRID_PROFIT_RATIO`: 网格利润率（默认0.5%）
   - `GRID_COUNT`: 网格数量（默认5个）
   - `POSITION_SIZE`: 每个网格的交易金额
   - `MAX_POSITIONS`: 最大持仓数量

2. 网格策略逻辑：
   - 在初始价格下方创建多个网格订单
   - 当价格下跌时，网格订单自动成交
   - 当价格上涨时，自动平仓获利
   - 平仓后自动在下方补充新的网格订单
   - 支持动态调整网格间距和数量

3. 风险控制：
   - 设置最大持仓数量限制
   - 支持止损机制
   - 交易手续费计算
   - 资金使用比例控制

## 回测功能

回测模块支持以下功能：
- 使用历史K线数据进行策略回测
- 计算总收益、手续费、止损次数等指标
- 生成详细的交易记录
- 保存未平仓仓位信息
- 支持多轮回测和结果分析

## 注意事项

- 请确保您的OKX API密钥具有适当的权限
- 建议先在测试环境中验证策略
- 请根据您的风险承受能力调整配置参数
- 确保正确配置Telegram通知参数
- 回测结果仅供参考，实际交易结果可能有所不同
- 建议定期检查程序运行状态和交易记录

## 许可证

MIT 

## 新增功能

- 实现动态网格间距
  - 根据市场波动率自动调整网格间距
  - 在不同价格区间使用不同的网格密度

- 改进止损机制
  - 添加单个网格的独立止损
  - 实现追踪止损功能
  - 加入基于波动率的动态止损

- 增加市场分析功能
  - 集成基本技术指标（如RSI、MACD等）
  - 添加趋势判断，在强趋势市场调整策略

- 资金管理
  - 实现动态仓位管理
  - 添加风险敞口控制
  - 设置每日最大亏损限制

- 订单执行优化
  - 添加市场深度分析
  - 实现智能滑点控制
  - 订单分批执行机制

- 异常处理
  - 完善WebSocket重连机制
  - 添加API请求重试机制
  - 实现关键操作的事务处理

- 监控告警
  - 添加系统健康检查
  - 实现更详细的日志记录
  - 设置关键指标监控和预警

- 回测功能扩展
  - 添加手续费模型
  - 实现滑点模拟
  - 支持多周期回测

- 性能分析
  - 添加更多统计指标
  - 实现策略参数优化
  - 提供可视化分析工具

- 添加市场情绪分析
- 实现多交易对支持
- 加入风险对冲机制
- 开发应急预案机制 