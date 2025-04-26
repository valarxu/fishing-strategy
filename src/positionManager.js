const fs = require('fs').promises;
const path = require('path');

class PositionManager {
    constructor() {
        this.positionsFile = path.join(__dirname, '../data/positions.json');
        this.ensureDataDirectory();
    }

    async ensureDataDirectory() {
        const dataDir = path.dirname(this.positionsFile);
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }
    }

    async loadPositions() {
        try {
            const data = await fs.readFile(this.positionsFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // 如果文件不存在，返回空数组
                return [];
            }
            console.error('加载仓位数据失败:', error);
            throw error;
        }
    }

    async savePositions(positions) {
        try {
            await fs.writeFile(this.positionsFile, JSON.stringify(positions, null, 2));
            console.log('仓位数据已保存');
        } catch (error) {
            console.error('保存仓位数据失败:', error);
            throw error;
        }
    }

    async addPosition(position) {
        const positions = await this.loadPositions();
        positions.push(position);
        await this.savePositions(positions);
    }

    async removePosition(index) {
        const positions = await this.loadPositions();
        positions.splice(index, 1);
        await this.savePositions(positions);
    }

    async clearPositions() {
        await this.savePositions([]);
    }

    async updatePositions(positions) {
        await this.savePositions(positions);
    }
}

module.exports = PositionManager; 