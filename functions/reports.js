const api = require('./api');

exports.handler = async (event, context) => {
  // 修改路径，使其符合 api.js 中的路由格式
  const path = event.path.replace('/.netlify/functions/reports', '/api/reports');
  const modifiedEvent = {
    ...event,
    path
  };
  
  // 调用 api 处理程序
  return api.handler(modifiedEvent, context);
}; 