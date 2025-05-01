const fs = require('fs').promises;
const path = require('path');

// 创建仓位管理器实例
const createPositionManager = () => {
    const positionsFile = path.join(__dirname, '../data/positions.json');

    // 确保数据目录存在
    const ensureDataDirectory = async () => {
        const dataDir = path.dirname(positionsFile);
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }
    };

    // 加载仓位数据
    const loadPositions = async () => {
        try {
            const data = await fs.readFile(positionsFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // 如果文件不存在，返回空数组
                return [];
            }
            console.error('加载仓位数据失败:', error);
            throw error;
        }
    };

    // 保存仓位数据
    const savePositions = async (positions) => {
        try {
            await fs.writeFile(positionsFile, JSON.stringify(positions, null, 2));
            console.log('仓位数据已保存');
        } catch (error) {
            console.error('保存仓位数据失败:', error);
            throw error;
        }
    };

    // 添加仓位
    const addPosition = async (position) => {
        const positions = await loadPositions();
        positions.push(position);
        await savePositions(positions);
    };

    // 移除仓位
    const removePosition = async (index) => {
        const positions = await loadPositions();
        positions.splice(index, 1);
        await savePositions(positions);
    };

    // 清空所有仓位
    const clearPositions = async () => {
        await savePositions([]);
    };

    // 更新仓位
    const updatePositions = async (positions) => {
        await savePositions(positions);
    };

    // 初始化数据目录
    ensureDataDirectory().catch(console.error);

    return {
        loadPositions,
        addPosition,
        removePosition,
        clearPositions,
        updatePositions
    };
};

module.exports = createPositionManager; 