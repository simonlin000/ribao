# AI自媒体创造营日报馆

这是一个用于存储和展示日报的网站系统，包含前端界面和后端服务器。

## 功能特点

- 日报内容的存储和展示
- 按日期归档和浏览
- 管理员可以添加、编辑和删除日报
- 访客可以浏览日报内容
- 响应式设计，支持移动端和桌面端
- 使用FaunaDB进行数据持久化存储

## 系统要求

- Node.js 12.0 或更高版本
- 现代浏览器（Chrome、Firefox、Safari、Edge等）
- FaunaDB账户（免费计划即可）

## 安装和运行

1. **FaunaDB设置**:

   - 注册并登录 [FaunaDB](https://fauna.com/)
   - 创建新数据库（如 `daily-reports`）
   - 在"Security"选项卡创建一个新的服务器密钥(Server Key)
   - 复制 `.env.example` 为 `.env` 并设置您的 FaunaDB 密钥:
     ```
     FAUNA_SECRET=您的FaunaDB密钥
     ```

2. 安装依赖包：

```bash
npm install
```

3. 本地开发启动（使用Netlify开发服务器）：

```bash
npm run dev
```

4. 在浏览器中访问：http://localhost:8888

## 部署到Netlify

1. 在Netlify创建一个新站点，连接到您的GitHub仓库
2. 在Netlify站点设置中添加环境变量 `FAUNA_SECRET`
3. 部署完成后，应用程序会自动创建所需的FaunaDB集合和索引

## 用户指南

### 访客登录

- 使用当前的动态密码登录（格式为KZK+MMDD，如KZK0512）
- 登录后可以浏览所有日报内容

### 管理员登录

- 用户名：simon912
- 密码：dabao0123
- 管理员可以添加、编辑和删除日报

## 技术栈

- 前端：HTML, CSS, JavaScript
- 后端：Node.js, Netlify Functions
- 数据存储：FaunaDB

## 文件结构

- `index.html`：前端界面
- `functions/api.js`：API后端服务
- `functions/reports.js`：重定向处理
- `netlify.toml`：Netlify配置文件
- `.env`：环境变量配置（本地开发用）

## FaunaDB数据结构

- **Collection**: `reports`
- **Index**: `reports_by_date` (terms: data.date, unique: true)
- **Documents**: 每个日报文档包含日期、星期和内容字段

## API接口

### 获取所有日报

```
GET /api/reports
```

### 获取特定日期的日报

```
GET /api/reports/:date
```

### 保存日报（需要认证）

```
POST /api/reports
Content-Type: application/json
Authorization: Basic base64(username:password)

{
  "date": "YYYY-MM-DD",
  "content": "HTML内容"
}
```

### 删除日报（需要认证）

```
DELETE /api/reports/:date
Authorization: Basic base64(username:password)
```