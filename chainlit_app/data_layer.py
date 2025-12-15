import chainlit.data as cl_data
from chainlit.types import ThreadDict, ThreadFilter, Pagination, PaginatedResponse
import aiohttp
import os
from typing import Optional, List, Dict, Any

class DjangoDataLayer(cl_data.BaseDataLayer):
    def __init__(self, api_base: str):
        self.api_base = api_base.rstrip("/")

    def _get_headers(self, token: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if token:
            headers['Authorization'] = f'Bearer {token}'
        return headers

    async def get_user(self, identifier: str):
        # We rely on auth_callback for user authentication
        return None

    async def create_user(self, user):
        # Users are created in Django
        return None

    async def list_threads(
        self, pagination: Pagination, filter: ThreadFilter
    ) -> PaginatedResponse[ThreadDict]:
        import chainlit as cl
        user = cl.user_session.get("user")
        print(f"DEBUG: list_threads called. User: {user}")
        if user:
            print(f"DEBUG: User metadata: {user.metadata}")
        
        token = user.metadata.get("token") if user else None

        
        if not token:
            return PaginatedResponse(data=[], hasMore=False)

        async with aiohttp.ClientSession(headers=self._get_headers(token)) as session:
            # We fetch all threads (Django handles pagination, but here we might just fetch latest 20)
            # Chainlit pagination: first, cursor, limit.
            async with session.get(f"{self.api_base}/chat/threads/") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    # Django ModelViewSet returns list or paginated result (results=[...])
                    # Assuming standard DRF pagination
                    threads_data = data.get('results', []) if isinstance(data, dict) else data
                    
                    mapped_threads = []
                    for t in threads_data:
                        mapped_threads.append({
                            "id": t.get("thread_id"),
                            "createdAt": t.get("created_at"),
                            "name": t.get("title") or "New Chat",
                            "userIdentifier": filter.userIdentifier,
                            "metadata": {"assistant_id": t.get("assistant_id")},
                            "steps": [], # Don't load steps in list view
                            "elements": []
                        })
                    
                    return PaginatedResponse(
                        data=mapped_threads,
                        hasMore=bool(data.get('next')) if isinstance(data, dict) else False
                    )
                return PaginatedResponse(data=[], hasMore=False)

    async def get_thread(self, thread_id: str) -> Optional[ThreadDict]:
        import chainlit as cl
        user = cl.user_session.get("user")
        token = user.metadata.get("token") if user else None
        if not token: return None

        async with aiohttp.ClientSession(headers=self._get_headers(token)) as session:
            # 1. Get thread details
            # 2. Get history
            # We can use our /history endpoint which calls LangGraph
            async with session.get(f"{self.api_base}/chat/threads/{thread_id}/history/") as resp:
                if resp.status == 200:
                    history = await resp.json()
                    # History is typically {'messages': [...]}
                    messages = history.get('messages', []) if isinstance(history, dict) else history
                    
                    steps = []
                    for msg in messages:
                        # Map LangGraph/OpenAI message to Chainlit Step
                        msg_type = msg.get("type") or msg.get("role")
                        content = msg.get("content", "")
                        
                        # Handle content being list (multimodal)
                        if isinstance(content, list):
                            text_parts = [c.get("text", "") for c in content if c.get("type") == "text"]
                            content = "".join(text_parts)
                        
                        steps.append({
                            "id": msg.get("id") or str(os.urandom(4).hex()), # Fake ID if missing
                            "type": "user_message" if msg_type in ("human", "user") else "assistant_message",
                            "output": content,
                            "createdAt": None, # LangGraph history might not have timestamps easily
                            "feedback": None,
                        })
                    
                    # Also need basic thread info (name etc), but get_thread might just need steps?
                    # Chainlit expects a ThreadDict.
                    return {
                        "id": thread_id,
                        "createdAt": None,
                        "name": "Chat",
                        "userIdentifier": user.identifier,
                        "steps": steps,
                        "elements": [],
                        "metadata": {}
                    }
        return None

    async def update_thread(self, thread_id: str, name: Optional[str] = None, user_id: Optional[str] = None, metadata: Optional[Dict] = None, tags: Optional[List[str]] = None):
        import chainlit as cl
        user = cl.user_session.get("user")
        token = user.metadata.get("token") if user else None
        if not token: return

        payload = {}
        if name: payload["title"] = name
        
        if payload:
            async with aiohttp.ClientSession(headers=self._get_headers(token)) as session:
                await session.patch(f"{self.api_base}/chat/threads/{thread_id}/", json=payload)

    async def delete_thread(self, thread_id: str):
        import chainlit as cl
        user = cl.user_session.get("user")
        token = user.metadata.get("token") if user else None
        if not token: return

        async with aiohttp.ClientSession(headers=self._get_headers(token)) as session:
            await session.delete(f"{self.api_base}/chat/threads/{thread_id}/")

    async def build_debug_url(self, thread_id: str):
        return f"{self.api_base}/chat/threads/{thread_id}/history/"

    async def close(self):
        return None

    async def create_element(self, element):
        return element

    async def create_step(self, step):
        return step

    async def delete_element(self, element_id: str):
        return None

    async def delete_feedback(self, feedback_id: str):
        return None

    async def delete_step(self, step_id: str):
        return None

    async def get_element(self, element_id: str):
        return None

    async def get_thread_author(self, thread_id: str):
        import chainlit as cl
        user = cl.user_session.get("user")
        return user.identifier if user else None

    async def update_step(self, step_id: str, **kwargs):
        return None

    async def upsert_feedback(self, feedback):
        return feedback
