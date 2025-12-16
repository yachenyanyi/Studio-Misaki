# Sakura AI 🌸

一个集成了 AI 聊天、博客系统、3D 游戏和实用工具的全栈 Web 应用程序。

## 📋 项目概述

Sakura AI 是一个现代化的 Web 应用程序，融合了人工智能交互、内容管理和娱乐功能。该项目包含以下主要功能：

- 🤖 **AI 智能聊天** - 基于 LangGraph 的流式对话系统
- 📝 **博客系统** - 文章发布、管理和展示
- 🎮 **3D 体素游戏** - 使用 React Three Fiber 构建的交互式 3D 世界
- 🛠️ **实用工具集** - JSON 格式化、颜色选择器、Base64 转换等
- 📊 **管理后台** - 用户管理、数据统计和系统监控

## 🏗️ 技术架构

### 前端 (React + TypeScript)
- **框架**: React 19.2.1 + TypeScript
- **构建工具**: Vite 7.2.4
- **路由**: React Router DOM 7.10.1
- **UI 动画**: Framer Motion 12.23.25
- **3D 渲染**: React Three Fiber + Three.js
- **状态管理**: React Context
- **HTTP 客户端**: Axios
- **Markdown 支持**: React Markdown + Remark GFM

### 后端 (Django REST Framework)
- **框架**: Django + Django REST Framework
- **数据库**: SQLite (可配置为 PostgreSQL/MySQL)
- **认证**: JWT Token 认证
- **API 文档**: Django REST Framework 内置
- **跨域支持**: Django CORS Headers

### AI 集成
- **LangGraph SDK**: 用于构建复杂的 AI 对话流程
- **流式响应**: 实时消息流处理
- **Token 追踪**: 详细的 API 使用统计

### 额外服务
- **Chainlit**: 独立的聊天界面服务
- **Live2D**: 动漫角色 Live2D 模型集成

## 📁 项目结构

```
react_django/
├── backend/                 # Django 后端
│   ├── backend/            # Django 项目配置
│   └── blog/               # 主要 Django 应用
│       ├── models.py       # 数据模型
│       ├── views.py        # API 视图
│       ├── serializers.py  # 序列化器
│       └── urls.py         # URL 路由
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── services/       # API 服务
│   │   ├── context/        # React Context
│   │   └── utils/          # 工具函数
│   └── package.json
├── chainlit_app/           # Chainlit 聊天应用
│   └── app.py
├── scripts/                # 脚本工具
└── start_all.bat          # Windows 启动脚本
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Python 3.8+
- pip

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/yourusername/react_django.git
cd react_django
```

2. **后端设置**
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # 创建管理员账户
python manage.py runserver 0.0.0.0:8000
```

3. **前端设置**
```bash
cd frontend
npm install
npm run dev
```

4. **Chainlit 应用 (可选)**
```bash
cd chainlit_app
pip install -r requirements.txt
chainlit run app.py -w --port 8001
```

### Windows 一键启动

运行 `start_all.bat` 即可同时启动所有服务：

- Django 后端: http://localhost:8000
- Chainlit 聊天: http://localhost:8001
- React 前端: http://localhost:5173

## 📖 功能模块

### 1. AI 聊天系统
- 支持多轮对话和上下文管理
- 实时流式响应
- 聊天历史记录
- Token 使用量统计
- 支持多个 AI 助手

### 2. 博客系统
- 文章的增删改查
- Markdown 编辑器支持
- 图片上传和管理
- 文章分类和标签
- 响应式阅读体验

### 3. 3D 体素游戏
- 基于 React Three Fiber 的 3D 环境
- 体素世界生成和编辑
- 物理引擎支持 (React Three Cannon)
- 第一人称视角控制

### 4. 实用工具
- JSON 格式化器
- 颜色调色板生成器
- Base64 编码/解码器
- 番茄钟计时器
- 图片格式转换器
- Emoji 混合器

### 5. 管理后台
- 用户管理和权限控制
- 网站访问统计
- Token 使用分析
- 文章内容管理
- 实时数据监控

## 🔧 配置说明

### 后端配置

在 `backend/backend/settings.py` 中配置：

```python
# 数据库设置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# LangGraph API 配置
LANGGRAPH_API_URL = "your_langgraph_api_url"
LANGGRAPH_API_KEY = "your_api_key"

# CORS 设置
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### 前端配置

在 `frontend/src/services/api.ts` 中配置 API 地址：

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

## 📝 API 文档

启动后端服务后，可以访问：
- API 文档: http://localhost:8000/api/docs/
- 管理后台: http://localhost:8000/admin/

### 主要 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/login/` | POST | 用户登录 |
| `/api/auth/register/` | POST | 用户注册 |
| `/api/articles/` | GET/POST | 文章列表/创建 |
| `/api/articles/{id}/` | GET/PUT/DELETE | 文章详情/更新/删除 |
| `/api/chat/threads/` | GET/POST | 聊天线程管理 |
| `/api/chat/stream/` | POST | 流式聊天接口 |
| `/api/analytics/visits/` | GET | 访问统计 |
| `/api/analytics/tokens/` | GET | Token 使用统计 |

## 🎨 UI 组件

### 主要组件

- `Header` - 导航栏
- `Hero` - 首页英雄区域
- `ChatRoom` - 聊天室组件
- `ChatPage` - 完整聊天页面
- `ArticleList` - 文章列表
- `ArticleDetail` - 文章详情
- `AdminDashboard` - 管理后台
- `Live2D` - Live2D 角色展示

### 工具组件

- `JsonFormatter` - JSON 格式化
- `ColorPalette` - 颜色选择器
- `Base64Converter` - Base64 转换
- `PomodoroTimer` - 番茄钟
- `ImageConverter` - 图片转换
- `EmojiMix` - Emoji 混合

## 🎯 开发指南

### 添加新的工具页面

1. 在 `frontend/src/components/tools/` 创建新组件
2. 在 `frontend/src/App.tsx` 中添加路由
3. 在 `frontend/src/components/ToolBar.tsx` 中添加链接

### 扩展 API

1. 在 `backend/blog/models.py` 定义数据模型
2. 在 `backend/blog/serializers.py` 创建序列化器
3. 在 `backend/blog/views.py` 实现视图
4. 在 `backend/blog/urls.py` 配置路由

### 数据库迁移

```bash
python manage.py makemigrations
python manage.py migrate
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 前端框架
- [Django](https://www.djangoproject.com/) - 后端框架
- [LangGraph](https://langchain-ai.github.io/langgraph/) - AI 框架
- [Three.js](https://threejs.org/) - 3D 图形库
- [Chainlit](https://chainlit.io/) - 聊天界面框架

## 📞 联系方式

项目主页: [GitHub Repository](https://github.com/yourusername/react_django)

问题反馈: [Issues](https://github.com/yourusername/react_django/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！