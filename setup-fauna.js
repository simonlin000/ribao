// FaunaDB设置脚本
// 运行方式: node setup-fauna.js
require('dotenv').config();
const faunadb = require('faunadb');
const q = faunadb.query;

// 检查环境变量
if (!process.env.FAUNA_SECRET) {
  console.error('错误: 未设置FAUNA_SECRET环境变量');
  console.error('请复制.env.example为.env并设置您的FaunaDB密钥');
  process.exit(1);
}

// 初始化FaunaDB客户端
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
  domain: 'db.fauna.com',
  scheme: 'https'
});

// 默认日报数据
const DEFAULT_REPORT = {
  date: '2025-03-26',
  weekday: '周三',
  content: '<div class="section"><h2>AI自媒体创造营日报</h2><p>欢迎来到AI自媒体创造营日报馆！这里收录了创造营的每日动态和精彩内容。</p></div>'
};

async function setupFaunaDB() {
  console.log('开始设置FaunaDB...');

  try {
    // 1. 创建reports集合
    try {
      await client.query(q.Exists(q.Collection('reports')));
      console.log('集合已存在: reports');
    } catch (error) {
      if (error.description && error.description.includes('Collection not found')) {
        await client.query(q.CreateCollection({ name: 'reports' }));
        console.log('已创建集合: reports');
      } else {
        throw error;
      }
    }

    // 2. 创建索引
    try {
      await client.query(q.Exists(q.Index('reports_by_date')));
      console.log('索引已存在: reports_by_date');
    } catch (error) {
      if (error.description && error.description.includes('Index not found')) {
        await client.query(
          q.CreateIndex({
            name: 'reports_by_date',
            source: q.Collection('reports'),
            terms: [{ field: ['data', 'date'] }],
            unique: true
          })
        );
        console.log('已创建索引: reports_by_date');
      } else {
        throw error;
      }
    }

    // 3. 创建默认日报
    try {
      const exists = await client.query(
        q.Exists(q.Match(q.Index('reports_by_date'), DEFAULT_REPORT.date))
      );
      if (exists) {
        console.log('默认日报已存在');
      } else {
        throw { name: 'NotFound' };
      }
    } catch (error) {
      if (error.name === 'NotFound') {
        await client.query(
          q.Create(
            q.Collection('reports'),
            { data: DEFAULT_REPORT }
          )
        );
        console.log('已创建默认日报');
      } else {
        throw error;
      }
    }

    console.log('FaunaDB设置完成！');
    
    // 验证设置
    console.log('\n验证设置:');
    const collections = await client.query(
      q.Map(
        q.Paginate(q.Collections()),
        q.Lambda(['ref'], q.Get(q.Var('ref')))
      )
    );
    
    console.log('数据库中的集合:');
    collections.data.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    const indices = await client.query(
      q.Map(
        q.Paginate(q.Indexes()),
        q.Lambda(['ref'], q.Get(q.Var('ref')))
      )
    );
    
    console.log('\n数据库中的索引:');
    indices.data.forEach(index => {
      console.log(`- ${index.name}`);
    });
    
    const reports = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('reports'))),
        q.Lambda(['ref'], q.Get(q.Var('ref')))
      )
    );
    
    console.log(`\n数据库中的日报条目: ${reports.data.length}个`);
    
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