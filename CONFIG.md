# 聊天与服务地址配置说明

## 概览
- 统一域名由 Django/网关承载：
  - `/api/*` → 后端 API
  - `/chat/*` → Chainlit（反向代理）
- LangGraph API 为内部服务，只允许受信组件访问。
- 所有地址通过环境变量与配置接口可动态调整，无需改代码。

## 环境变量
- 后端（`backend/backend/settings.py`）：
  - `LANGGRAPH_API_URL`：默认 `http://127.0.0.1:2024`
  - `CHAINLIT_BASE_URL`：默认 `http://localhost:8001`（生产推荐 `/chat`）
  - `CHAT_TOKEN_SECRET`：聊天短时令牌密钥
  - `SERVICE_TOKEN_SECRET`：服务间令牌密钥
- 前端（React `.env`）：
  - `VITE_API_BASE`：后端 API 基地址（默认 `http://127.0.0.1:8000/api`）
  - `VITE_CHAT_BASE_URL`：聊天入口地址（默认 `http://localhost:8001`）
- Chainlit（`.env`）：
  - `CHAT_TOKEN_SECRET`：用于校验短时令牌
  - 可选 `BACKEND_API_BASE`、`LANGGRAPH_API_URL`

## 配置接口
`GET /api/chat/config` 返回：
```json
{
  "chainlit_base_url": "http://localhost:8001",
  "langgraph_api_url": "http://127.0.0.1:2024",
  "token_ttl_seconds": 600,
  "aud": "chainlit",
  "iss": "django"
}
```
- 前端 `ChatRoom` 会读取该接口，动态设置 iframe 源；接口不可用时回退到环境变量。

## 地址变更流程
1. 修改 `.env` 或部署环境中的相关变量；
2. 如果是网关（Nginx/Caddy）上游地址变更，更新反代指向并重载配置；
3. 无需改前后端代码；前端将自动读取 `GET /api/chat/config` 并使用新地址。

## 注意事项
- 生产环境中建议将 Chainlit 挂载到 `/chat`，统一域名避免跨域问题。
- LangGraph API 建议仅监听内网地址，并启用服务令牌校验与线程归属授权。
- 令牌 TTL 建议 10 分钟，令牌仅存在内存，不写入本地存储。

## 故障处理
- 若前端无法连接聊天：检查 `/api/chat/config` 是否返回正确地址；检查网关反代配置与链路（WebSocket/SSE）。
- 若报 401：确认登录状态与令牌有效期；必要时刷新令牌并重载 iframe。
