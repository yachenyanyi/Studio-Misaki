## 目标

* 统一域名，通过网关将聊天挂载到 `/chat`，仅登录后可访问。

* 将聊天登录入口移到 Chainlit 页面。

* 保护 LangGraph API（仅受信组件可访问）。

* 提供“可配置地址能力”：能够在不改代码的前提下切换 LangGraph 与 Chainlit 的 API 地址，并自动接入/跳转。

## 配置项设计

* 后端（Django 环境变量）

  * `CHAT_TOKEN_SECRET`：用户聊天短时令牌密钥

  * `SERVICE_TOKEN_SECRET`：服务间令牌密钥

  * `CHAINLIT_BASE_URL`：Chainlit 对外地址（示例：`http://localhost:8001`，生产推荐 `/chat`）

  * `LANGGRAPH_API_URL`：LangGraph 内部地址（示例：`http://127.0.0.1:2024`）

* 前端（React `.env`）

  * `VITE_API_BASE`：后端 API 地址（示例：`http://localhost:8000/api`）

  * `VITE_CHAT_BASE_URL`：聊天入口地址（示例：`http://localhost:8000/chat` 或 `http://localhost:8001`）

* Chainlit（`.env`）

  * `CHAT_TOKEN_SECRET`：用于校验短时令牌

  * 可选：`BACKEND_API_BASE`：后端地址（用于登录、令牌刷新、配置拉取）

  * 可选：`LANGGRAPH_API_URL`：直连 LangGraph 时使用（若走网关可不配）

## 动态配置与自动接入

* 新增后端配置接口：`GET /api/chat/config`

  * 返回：`{ chainlit_base_url, langgraph_api_url, token_ttl, aud, iss }`

  * 供前端与 Chainlit 拉取最新配置；变更不需改代码。

* 前端逻辑

  * 初始加载从 `GET /api/chat/config` 拿 `chainlit_base_url`，设置 iframe `src`

  * 登录后刷新一次令牌，并重载 iframe；

  * 监听 401/连接失败→自动重新拉取配置并跳转新地址。

* Chainlit 登录页逻辑

  * 从 `BACKEND_API_BASE` 拉取配置；

  * 登录成功后调用 `POST /api/chat/access-token/` 获取令牌，并重定向到根路径（或拼接 `?token=`）。

## 网关（Nginx/Caddy）接入要点

* 路由：

  * `/api/*` → Django

  * `/chat/*` → Chainlit（带 WebSocket/SSE 反代配置）

* 前置校验：

  * 访问 `/chat/*` 前，通过 Django 会话检查；未登录 `302 /login?next=/chat`

  * 已登录：获取短时令牌，转发到 Chainlit 并附 `Authorization: Bearer <token>`

* 变更容错：

  * 当地址变更时只需更新 Nginx 上游；前端与 Chainlit通过配置接口/环境变量感知，无需改代码。

## LangGraph API 保护

* 仅绑定内网地址（`127.0.0.1:2024` 或容器网络），不对浏览器暴露。

* 要求服务令牌：所有端点检查 `Authorization: Bearer <service_token>`。

* 线程授权：对 `/threads/*`、`/runs/*`、`/history` 检查 `user_id` 与 `thread_id` 归属（调用后端校验或共享缓存）。

## Chainlit 鉴权中间件

* 所有入口（HTML、WebSocket/SSE）校验客户端令牌，失败返回 401→显示“请登录”页。

* UI 入口 `/login`：提交至后端登录与令牌签发；成功后跳回根路径。

* 读取配置：

  * 启动时从后端 `GET /api/chat/config` 拉取；失败回退到 `.env` 值。

## 文档更新结构

1. 快速开始

* 单域名路由结构、示例地址、登录与访问流程

1. 配置

* 所有环境变量清单与默认值

* 配置接口 `GET /api/chat/config` 返回字段说明

* 地址变更步骤（仅改 `.env` 或网关上游）

1. 网关示例

* Nginx/Caddy 配置片段（包含 WebSocket/SSE）

1. 安全指南

* 双令牌机制、CORS/CSRF、速率限制与审计

1. 故障处理

* 401/403/5xx 排查与令牌刷新

1. 常见变更

* Chainlit/ LangGraph 地址变更与自动接入流程

## 安全与兼容

* 令牌 TTL：10 分钟（5 分钟内自动续期）；校验 `aud/iss/exp/sub`；仅内存存放。

* 反代设置：`upgrade/connection/http_version` 保障 WS/SSE；关闭过度缓冲。

* 统一域名后收紧 CORS；生产开启 HTTPS。

## 测试清单

* 未登录访问 `/chat`：重定向 `/login`

* 登录后访问 `/chat`：正常聊天，线程记录到用户

* 令牌过期：自动刷新或提示重新登录

* 更换 Chainlit/LangGraph 地址：

  * 更新 `.env` 或配置接口返回→前端与 Chainlit自动应用并正常连接

* WebSocket/SSE 稳定性与限流

## 交付步骤

1. 后端：实现 `GET /api/chat/config` 与令牌签发接口、线程归属校验。
2. Chainlit：实现鉴权中间件与 `/login` 页面；支持配置拉取与地址变更。
3. 网关：配置 `/chat/*` 反代与前置会话校验；
4. 前端：使用配置接口设置 iframe 源；移除聊天登录遮罩；
5. 文档：按上述结构补齐说明；
6. 验收测试通过后上线。

