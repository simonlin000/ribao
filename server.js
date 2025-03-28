const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 确保数据目录存在
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// 日报数据文件路径
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

// 初始化日报数据文件
if (!fs.existsSync(REPORTS_FILE)) {
    // 创建默认的日报数据
    const defaultReports = {
        '2025-03-26': {
            date: '2025-03-26',
            weekday: '周三',
            content: '<div class="section"><h2>AI自媒体创造营日报</h2><p>欢迎来到AI自媒体创造营日报馆！这里收录了创造营的每日动态和精彩内容。</p></div>'
        }
    };
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(defaultReports, null, 2));
}

// 中间件
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// 允许跨域请求
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

// 简单的身份验证中间件
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ message: '未提供认证信息' });
    }
    
    // 这里使用一个简单的认证方式，实际应用中应该使用更安全的方法
    // 格式: "Basic base64(username:password)"
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');
    
    // 检查用户名和密码是否匹配
    if (username === 'simon912' && password === 'dabao0123') {
        req.user = { username, isAdmin: true };
        next();
    } else {
        res.status(401).json({ message: '认证失败' });
    }
};

// 获取所有日报
app.get('/api/reports', (req, res) => {
    try {
        const reportsData = fs.readFileSync(REPORTS_FILE, 'utf8');
        const reports = JSON.parse(reportsData);
        res.json(reports);
    } catch (error) {
        console.error('获取日报失败:', error);
        res.status(500).json({ message: '获取日报失败', error: error.message });
    }
});

// 获取特定日期的日报
app.get('/api/reports/:date', (req, res) => {
    try {
        const { date } = req.params;
        const reportsData = fs.readFileSync(REPORTS_FILE, 'utf8');
        const reports = JSON.parse(reportsData);
        
        if (reports[date]) {
            res.json(reports[date]);
        } else {
            res.status(404).json({ message: '未找到指定日期的日报' });
        }
    } catch (error) {
        console.error('获取日报失败:', error);
        res.status(500).json({ message: '获取日报失败', error: error.message });
    }
});

// 保存日报（需要认证）
app.post('/api/reports', authenticate, (req, res) => {
    try {
        const { date, content } = req.body;
        
        if (!date || !content) {
            return res.status(400).json({ message: '日期和内容不能为空' });
        }
        
        // 创建日期对象
        const dateObj = new Date(date);
        const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.getDay()];
        
        // 读取现有日报
        const reportsData = fs.readFileSync(REPORTS_FILE, 'utf8');
        const reports = JSON.parse(reportsData);
        
        // 更新或添加日报
        reports[date] = {
            date,
            weekday,
            content
        };
        
        // 保存回文件
        fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
        
        res.json({ message: '日报保存成功', report: reports[date] });
    } catch (error) {
        console.error('保存日报失败:', error);
        res.status(500).json({ message: '保存日报失败', error: error.message });
    }
});

// 删除日报（需要认证）
app.delete('/api/reports/:date', authenticate, (req, res) => {
    try {
        const { date } = req.params;
        
        // 读取现有日报
        const reportsData = fs.readFileSync(REPORTS_FILE, 'utf8');
        const reports = JSON.parse(reportsData);
        
        // 检查日报是否存在
        if (!reports[date]) {
            return res.status(404).json({ message: '未找到指定日期的日报' });
        }
        
        // 删除日报
        delete reports[date];
        
        // 保存回文件
        fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
        
        res.json({ message: '日报删除成功' });
    } catch (error) {
        console.error('删除日报失败:', error);
        res.status(500).json({ message: '删除日报失败', error: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});