const fs = require('fs');
const path = require('path');

// 确保数据目录存在
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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

// 简单的身份验证函数
const authenticate = (event) => {
  const authHeader = event.headers.authorization;
  
  if (!authHeader) {
    return false;
  }
  
  // 格式: "Basic base64(username:password)"
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');
  
  // 检查用户名和密码是否匹配
  return username === 'simon912' && password === 'dabao0123';
};

// Netlify 函数处理程序
exports.handler = async function(event, context) {
  // 启用 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };
  
  // 预检请求处理
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }
  
  // 获取请求路径
  const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '') || '/';
  
  try {
    // 处理 GET /reports - 获取所有日报
    if (event.httpMethod === 'GET' && path === '/reports') {
      const reportsData = fs.readFileSync(REPORTS_FILE, 'utf8');
      const reports = JSON.parse(reportsData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(reports)
      };
    }
    
    // 处理 GET /reports/:date - 获取特定日期的日报
    if (event.httpMethod === 'GET' && path.startsWith('/reports/')) {
      const date = path.split('/reports/')[1];
      const reportsData = fs.readFileSync(REPORTS_FILE, 'utf8');
      const reports = JSON.parse(reportsData);
      
      if (reports[date]) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(reports[date])
        };
      } else {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '未找到指定日期的日报' })
        };
      }
    }
    
    // 处理 POST /reports - 保存日报（需要认证）
    if (event.httpMethod === 'POST' && path === '/reports') {
      if (!authenticate(event)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: '认证失败' })
        };
      }
      
      const { date, content } = JSON.parse(event.body);
      
      if (!date || !content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: '日期和内容不能为空' })
        };
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
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: '日报保存成功', report: reports[date] })
      };
    }
    
    // 处理 DELETE /reports/:date - 删除日报（需要认证）
    if (event.httpMethod === 'DELETE' && path.startsWith('/reports/')) {
      if (!authenticate(event)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: '认证失败' })
        };
      }
      
      const date = path.split('/reports/')[1];
      
      // 读取现有日报
      const reportsData = fs.readFileSync(REPORTS_FILE, 'utf8');
      const reports = JSON.parse(reportsData);
      
      // 检查日报是否存在
      if (!reports[date]) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: '未找到指定日期的日报' })
        };
      }
      
      // 删除日报
      delete reports[date];
      
      // 保存回文件
      fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: '日报删除成功' })
      };
    }
    
    // 未找到匹配的路由
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: '未找到请求的资源' })
    };
    
  } catch (error) {
    console.error('处理请求失败:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: '服务器内部错误', error: error.message })
    };
  }
}; 