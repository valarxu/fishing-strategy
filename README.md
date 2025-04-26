# 自动交易策略

这是一个基于OKX交易所的自动交易策略程序。程序使用WebSocket实时接收5分钟K线数据，并根据预设策略执行交易操作。

## 功能特点

- 实时监控5分钟K线数据
- 自动执行开仓、平仓操作
- 支持止损机制
- 本地保存仓位信息
- 模块化设计，代码结构清晰

## 项目结构

```
├── src/
│   ├── index.js          # 主程序入口
│   ├── config.js         # 配置文件
│   ├── websocketClient.js # WebSocket客户端
│   ├── strategy.js       # 交易策略
│   ├── trader.js         # 交易执行
│   └── positionManager.js # 仓位管理
├── data/                 # 数据存储目录
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
编辑 `.env` 文件，填入您的OKX API密钥信息：
```
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here
PASSPHRASE=your_passphrase_here
```

## 运行

启动程序：
```bash
npm start
```

## 交易策略说明

1. 开仓条件：
   - 当前价格低于标记价格的预设阈值
   - 当前持仓数量未达到最大限制

2. 平仓条件：
   - 当前价格高于开仓价格的预设阈值

3. 止损条件：
   - 当持仓达到最大数量时
   - 当前价格低于所有持仓均价的预设阈值

## 注意事项

- 请确保您的OKX API密钥具有适当的权限
- 建议先在测试环境中验证策略
- 请根据您的风险承受能力调整配置参数

## 许可证

MIT 