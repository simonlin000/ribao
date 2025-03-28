# AI自媒体创造营日报馆

这是一个用于存储和展示日报的网站系统，包含前端界面和后端服务器。

## 功能特点

- 日报内容的存储和展示
- 按日期归档和浏览
- 管理员可以添加、编辑和删除日报
- 访客可以浏览日报内容
- 响应式设计，支持移动端和桌面端

## 系统要求

- Node.js 12.0 或更高版本
- 现代浏览器（Chrome、Firefox、Safari、Edge等）

## 安装和运行

1. 安装依赖包：

```bash
npm install
```

2. 启动服务器：

```bash
npm start
```

3. 在浏览器中访问：http://localhost:3000

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
- 后端：Node.js, Express
- 数据存储：JSON文件

## 文件结构

- `index.html`：前端界面
- `server.js`：后端服务器
- `data/reports.json`：日报数据存储文件
- `package.json`：项目依赖配置

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