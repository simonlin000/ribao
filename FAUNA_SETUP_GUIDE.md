# FaunaDB手动设置指南

由于您的FaunaDB账户可能有FQL v4限制，无法使用自动脚本创建数据库结构，这个指南将帮助您手动设置FaunaDB以正常运行日报系统。

## 前提条件

1. FaunaDB账户
2. 您的FaunaDB密钥: `fnAF67X3HcAAQqfXhRi9aaaBU7N8W4Xy5Q0DYKYI`

## 步骤1: 创建集合

1. 登录FaunaDB Dashboard: https://dashboard.fauna.com/
2. 选择或创建您的数据库
3. 在左侧导航栏中点击"Collections"
4. 点击"New Collection"按钮
5. 输入名称: `reports`
6. 点击"Save"保存

## 步骤2: 创建索引

1. 在左侧导航栏中点击"Indexes"（如果找不到，可能在"Collections"页面内部）
2. 点击"New Index"按钮
3. 填写以下信息:
   - **Name**: `reports_by_date`
   - **Source Collection**: `reports`
   - **Terms**: 点击"Add Field"并输入 `data.date`
   - **Values**: 如果需要添加值，可以指定`ref`或其他必要字段
   - **Unique**: 勾选此选项
4. 点击"Save"保存

## 步骤3: 创建默认日报

1. 在左侧导航栏中点击"Collections"
2. 点击刚刚创建的`reports`集合
3. 点击"New Document"按钮
4. 填写如下JSON文档:

```json
{
  "data": {
    "date": "2025-03-26",
    "weekday": "周三",
    "content": "<div class=\"section\"><h2>AI自媒体创造营日报</h2><p>欢迎来到AI自媒体创造营日报馆！这里收录了创造营的每日动态和精彩内容。</p></div>"
  }
}
```

5. 点击"Save"保存

## 步骤4: 验证设置

要验证您的设置是否正确:

1. 在`reports`集合中，您应该能看到刚创建的文档
2. 尝试使用索引查询:
   - 点击"Indexes"
   - 选择`reports_by_date`索引
   - 点击"Filter by this Index"
   - 在弹出的框中输入: `"2025-03-26"`
   - 应该返回刚才创建的文档

## 步骤5: 联系FaunaDB支持

如果您想解除FQL v4限制，可以:

1. 访问 https://support.fauna.com
2. 创建一个支持工单，解释您的情况
3. 提及错误信息: "FQL v4 requests have been disabled for your account"

## 环境变量设置

确保您已在本地和Netlify环境中设置了正确的环境变量:

- 本地开发: 创建`.env`文件并设置`FAUNA_SECRET=fnAF67X3HcAAQqfXhRi9aaaBU7N8W4Xy5Q0DYKYI`
- Netlify: 在环境变量设置中添加`FAUNA_SECRET=fnAF67X3HcAAQqfXhRi9aaaBU7N8W4Xy5Q0DYKYI` 