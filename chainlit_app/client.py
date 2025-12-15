import os
import aiohttp
import json
from typing import Optional, Dict, Any, List, AsyncGenerator

class LangSmithClient:
    def __init__(self, base_url: str = "http://localhost:8123", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if api_key:
            self.headers["x-api-key"] = api_key

    def _get_headers(self, token: Optional[str] = None) -> Dict[str, str]:
        headers = self.headers.copy()
        if token:
            headers['Authorization'] = f'Bearer {token}'
        return headers

    async def list_assistants(self, token: Optional[str] = None) -> List[Dict[str, Any]]:
        """获取所有可用智能体"""
        async with aiohttp.ClientSession(headers=self._get_headers(token)) as session:
            async with session.post(f"{self.base_url}/assistants/search", json={"limit": 100}) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
                return []

    async def create_thread(self, metadata: Optional[Dict] = None, token: Optional[str] = None) -> Dict[str, Any]:
        """创建新会话"""
        payload = {"metadata": metadata or {}}
        async with aiohttp.ClientSession(headers=self._get_headers(token)) as session:
            async with session.post(f"{self.base_url}/threads", json=payload) as response:
                return await response.json()

    async def get_thread_history(self, thread_id: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
        """获取会话历史"""
        async with aiohttp.ClientSession(headers=self._get_headers(token)) as session:
            async with session.get(f"{self.base_url}/threads/{thread_id}/history") as response:
                if response.status == 200:
                    return await response.json()
                return []

    async def run_stream(self, 
                        thread_id: str, 
                        assistant_id: str, 
                        input_data: Dict[str, Any],
                        files: Optional[List[Dict]] = None,
                        token: Optional[str] = None) -> AsyncGenerator[str, None]:
        """流式运行对话"""
        payload = {
            "assistant_id": assistant_id,
            "input": input_data,
            "stream_mode": "messages-tuple"
        }
        
        # 如果有文件，这里需要根据 API 文档调整 payload 结构
        # 假设 API 接受 input 中包含 attachments
        if files:
             # 这里是一个假设的结构，实际需要参考具体 API 定义
            if "messages" not in payload["input"]:
                 payload["input"]["messages"] = []
            
            # 简单的多模态处理逻辑，后续完善
            pass

        headers = self._get_headers(token)
        headers["Accept"] = "text/event-stream"

        async with aiohttp.ClientSession(headers=headers) as session:
            async with session.post(f"{self.base_url}/threads/{thread_id}/runs/stream", json=payload) as response:
                if response.status != 200:
                    try:
                        err = await response.text()
                    except Exception:
                        err = f"HTTP {response.status}"
                    yield f"错误：{err}"
                    return
                while True:
                    line = await response.content.readline()
                    if not line:
                        break
                    decoded_line = line.decode("utf-8", errors="ignore").strip()
                    if not decoded_line:
                        continue
                    if not decoded_line.startswith("data:"):
                        continue
                    raw = decoded_line[5:].strip()
                    try:
                        payload_obj = json.loads(raw)
                    except Exception:
                        yield raw
                        continue
                    # 支持两种格式：dict 或 [event, data]
                    event_name = None
                    data = None
                    if isinstance(payload_obj, list) and len(payload_obj) >= 2:
                        event_name = payload_obj[0]
                        data = payload_obj[1]
                    elif isinstance(payload_obj, dict):
                        event_name = payload_obj.get("event")
                        data = payload_obj.get("data", {})
                        if not event_name:
                            # 有的实现直接返回 message 对象
                            data = payload_obj
                            event_name = data.get("type") or "messages/complete"
                    else:
                        # 非预期格式，直接输出字符串
                        yield str(payload_obj)
                        continue
                    # 过滤无用事件
                    if event_name and (
                        "metadata" in event_name or "heartbeat" in event_name or "checkpointer" in event_name
                    ):
                        continue
                    # 提取文本内容
                    content = None
                    if isinstance(data, dict):
                        # 完整消息
                        if isinstance(data.get("content"), str):
                            content = data["content"]
                        elif isinstance(data.get("content"), list):
                            parts = []
                            for item in data["content"]:
                                if isinstance(item, dict):
                                    if item.get("type") == "text" and "text" in item:
                                        parts.append(item["text"])
                                    elif "content" in item and isinstance(item["content"], str):
                                        parts.append(item["content"])
                                elif isinstance(item, str):
                                    parts.append(item)
                            content = "".join(parts) if parts else None
                        # 增量 token
                        if not content:
                            delta = data.get("delta") or data.get("token")
                            if isinstance(delta, str):
                                content = delta
                    elif isinstance(data, str):
                        content = data
                    # 输出内容
                    if content:
                        yield content
                    # 结束事件处理：继续读取直到连接关闭
                    # messages-tuple 会多次发送 partial/complete，保持持续迭代

    async def run_wait(self, thread_id: str, assistant_id: str, input_data: Dict[str, Any], token: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "assistant_id": assistant_id,
            "input": input_data
        }
        async with aiohttp.ClientSession(headers=self._get_headers(token)) as session:
            async with session.post(f"{self.base_url}/threads/{thread_id}/runs/wait", json=payload) as response:
                try:
                    return await response.json()
                except Exception:
                    text = await response.text()
                    return {"error": text}

# 单例实例，后续在 app.py 中使用
# client = LangSmithClient(base_url=os.getenv("LANGSMITH_API_URL", "http://localhost:8123"))
