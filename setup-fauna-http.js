// FaunaDB设置脚本 - 使用HTTP请求
// 运行方式: node setup-fauna-http.js
require('dotenv').config();
const fetch = require('node-fetch');

// 检查环境变量
if (!process.env.FAUNA_SECRET) {
  console.error('错误: 未设置FAUNA_SECRET环境变量');
  console.error('请复制.env.example为.env并设置您的FaunaDB密钥');
  process.exit(1);
}

// FaunaDB HTTP配置
const FAUNA_ENDPOINT = 'https://db.fauna.com';
const headers = {
  'Authorization': `Bearer ${process.env.FAUNA_SECRET}`,
  'Content-Type': 'application/json'
};

// 默认日报数据
const DEFAULT_REPORT = {
  date: '2025-03-26',
  weekday: '周三',
  content: '<div class="section"><h2>AI自媒体创造营日报</h2><p>欢迎来到AI自媒体创造营日报馆！这里收录了创造营的每日动态和精彩内容。</p></div>'
};

// 发送请求到FaunaDB
async function faunaFetch(body) {
  try {
    const response = await fetch(FAUNA_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`FaunaDB错误: ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    console.error('FaunaDB请求失败:', error);
    throw error;
  }
}

async function setupFaunaDB() {
  console.log('开始设置FaunaDB...');

  try {
    // 1. 创建reports集合
    try {
      console.log('尝试创建reports集合...');
      await faunaFetch({
        create_collection: {
          name: 'reports'
        }
      });
      console.log('已创建集合: reports');
    } catch (error) {
      // 忽略已存在的情况
      if (error.message.includes('already exists')) {
        console.log('集合已存在: reports');
      } else {
        throw error;
      }
    }

    // 2. 创建索引
    try {
      console.log('尝试创建reports_by_date索引...');
      await faunaFetch({
        create_index: {
          name: 'reports_by_date',
          source: { collection: 'reports' },
          terms: [{ field: ['data', 'date'] }],
          unique: true
        }
      });
      console.log('已创建索引: reports_by_date');
    } catch (error) {
      // 忽略已存在的情况
      if (error.message.includes('already exists')) {
        console.log('索引已存在: reports_by_date');
      } else {
        throw error;
      }
    }

    // 3. 创建默认日报
    try {
      console.log('尝试创建默认日报...');
      // 查找是否已存在默认日报
      const findResult = await faunaFetch({
        paginate: {
          match: { index: 'reports_by_date' },
          terms: DEFAULT_REPORT.date
        }
      });
      
      if (findResult.data && findResult.data.length > 0) {
        console.log('默认日报已存在');
      } else {
        // 创建默认日报
        await faunaFetch({
          create: {
            collection: 'reports',
            data: DEFAULT_REPORT
          }
        });
        console.log('已创建默认日报');
      }
    } catch (error) {
      throw error;
    }

    console.log('FaunaDB设置完成！');
    
    // 验证设置
    console.log('\n验证设置:');
    // 获取所有集合
    const collectionsResult = await faunaFetch({
      paginate: { collections: true }
    });
    
    console.log('数据库中的集合:');
    if (collectionsResult.data && collectionsResult.data.length > 0) {
      collectionsResult.data.forEach(collection => {
        console.log(`- ${collection.id}`);
      });
    } else {
      console.log('(无集合)');
    }
    
    // 获取所有索引
    const indexesResult = await faunaFetch({
      paginate: { indexes: true }
    });
    
    console.log('\n数据库中的索引:');
    if (indexesResult.data && indexesResult.data.length > 0) {
      indexesResult.data.forEach(index => {
        console.log(`- ${index.id}`);
      });
    } else {
      console.log('(无索引)');
    }
    
    // 获取所有日报
    const reportsResult = await faunaFetch({
      paginate: {
        documents: { collection: 'reports' }
      }
    });
    
    console.log(`\n数据库中的日报条目: ${reportsResult.data ? reportsResult.data.length : 0}个`);
    
  } catch (error) {
    console.error('设置FaunaDB时出错:', error);
    process.exit(1);
  }
}

// 运行设置函数
setupFaunaDB()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('脚本运行失败:', error);
    process.exit(1);
  }); 