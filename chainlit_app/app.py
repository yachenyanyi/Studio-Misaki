import chainlit as cl
import random
import os
import json
import base64
import uuid
import aiohttp
from client import LangSmithClient
from data_layer import DjangoDataLayer

# --- 配置 ---
# 建议将 API URL 放入环境变量或 .env 文件
API_URL = os.getenv("LANGSMITH_API_URL", "http://127.0.0.1:8000/api/chatproxy")
API_KEY = os.getenv("LANGSMITH_API_KEY", None)

client = LangSmithClient(base_url=API_URL, api_key=API_KEY)
cl.data_layer = DjangoDataLayer(api_base=os.getenv("DJANGO_API_BASE", "http://127.0.0.1:8000/api"))

# 映射后端 LangGraph 配置中的图 ID 到易读名称
GRAPH_MAP = {
    "角色扮演智能体": "role_playing_agent",
    "基础文件系统智能体": "basic_filesystem_agent",
    "纯状态智能体": "state_only_agent",
    "持久记忆智能体": "persistent_memory_agent",
    "混合存储智能体": "hybrid_storage_agent",
    "分析智能体": "analytics_agent",
    "企业智能体": "enterprise_agent",
    "智能深度助手": "intelligent_deep_assistant",
    "简单图": "simple_graph",
}

@cl.password_auth_callback
async def auth_callback(username, password):
    login_url = "http://127.0.0.1:8000/api/auth/login/"
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(login_url, json={"username": username, "password": password}) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    token = data.get("token")
                    # cl.user_session.set("token", token)  # Removed: Context not available here
                    return cl.User(identifier=username, metadata={"token": token})
                else:
                    return None
        except Exception as e:
            print(f"Auth error: {e}")
            return None

# 默认的回退角色
DEFAULT_PROFILES = [
    cl.ChatProfile(
        name="Magical Girl",
        markdown_description="和你签订契约的魔法少女",
        icon="https://api.dicebear.com/7.x/avataaars/svg?seed=MagicalGirl&backgroundColor=ffdfbf",
    ),
    cl.ChatProfile(
        name="Cyber Diva",
        markdown_description="来自未来的虚拟偶像",
        icon="https://api.dicebear.com/7.x/avataaars/svg?seed=Diva&backgroundColor=b6e3f4",
    ),
]

# --- 1. 角色设定 (Chat Profiles) ---
@cl.set_chat_profiles
async def chat_profile():
    profiles = []
    for display_name, graph_id in GRAPH_MAP.items():
        seed = graph_id.replace("_", "")
        profiles.append(
            cl.ChatProfile(
                name=display_name,
                markdown_description=f"后端图: `{graph_id}`",
                icon=f"https://api.dicebear.com/7.x/avataaars/svg?seed={seed}",
            )
        )
    return profiles or DEFAULT_PROFILES

@cl.set_starters
async def set_starters():
    return [
        cl.Starter(
            label="施展魔法",
            message="巴啦啦能量！✨ 变身！",
            icon="/public/wand.svg",
            ),
        cl.Starter(
            label="唱首歌吧",
            message="能为我唱一首《恋爱循环》吗？🎵",
            icon="/public/music.svg",
            ),
    ]

@cl.on_chat_start
async def start():
    # 1. 获取用户选择的角色
    chat_profile_name = cl.user_session.get("chat_profile")
    assistant_id = GRAPH_MAP.get(chat_profile_name) or "intelligent_deep_assistant"
    
    # 获取 Token (从 User metadata)
    user = cl.user_session.get("user")
    token = user.metadata.get("token") if user else None

    # 2. 创建新会话 (Thread)
    thread_id = None
    try:
        # 构造 metadata
        metadata = {}
        if chat_profile_name:
            metadata["user_profile"] = chat_profile_name
            metadata["graph_id"] = assistant_id
            
        thread_data = await client.create_thread(metadata=metadata, token=token)
        print(f"DEBUG: Create Thread Response: {thread_data}")
        
        # 尝试获取 ID，支持多种可能的返回结构
        if isinstance(thread_data, dict):
            thread_id = thread_data.get("thread_id") or thread_data.get("id")
        
        if not thread_id:
             print("WARNING: Could not extract thread_id from response")

    except Exception as e:
        print(f"Error creating thread: {e}")

    # 如果 API 创建失败或没拿到 ID，生成一个本地的 UUID
    # 这样即使后端报错，前端也能继续尝试（虽然可能还是会 404，但至少格式是对的）
    # 或者，如果确定是本地 Mock，应该用特殊标记
    if not thread_id:
        # 尝试生成一个合法的 UUID，以防万一后端只是没返回 ID 但接受自定义 ID（虽然 create_thread 通常由后端生成）
        # 但既然我们遇到了 "None" 错误，说明我们必须确保它不是 None
        # 如果是 Mock 模式，我们用一个假的 UUID
        thread_id = str(uuid.uuid4())
        print(f"FALLBACK: Generated local UUID: {thread_id}")
        # 标记为 Mock 模式，避免发给真实 API 导致 404
        cl.user_session.set("is_mock_mode", True)
    else:
        cl.user_session.set("is_mock_mode", False)

    # 存入 session
    cl.user_session.set("thread_id", thread_id)
    cl.user_session.set("assistant_id", assistant_id)

    print(f"Final Thread ID: {thread_id}")

    # 3. 发送欢迎消息
    image = cl.Image(url="https://picsum.photos/600/300?blur=2", name="hero_image", display="inline")
    welcome_msg = f"### 🌸 欢迎来到二次元世界！\n"
    if chat_profile_name:
        welcome_msg += f"当前连接对象：**{chat_profile_name}**（图ID：`{assistant_id}`）\n"
    welcome_msg += "我是你的专属 AI 伙伴。在这里，魔法与科技交织... ✨"

    await cl.Message(
        content=welcome_msg,
        elements=[image]
    ).send()

@cl.on_message
async def main(message: cl.Message):
    content = message.content
    thread_id = cl.user_session.get("thread_id")
    assistant_id = cl.user_session.get("assistant_id") 
    is_mock_mode = cl.user_session.get("is_mock_mode", False)
    
    user = cl.user_session.get("user")
    token = user.metadata.get("token") if user else None

    msg = cl.Message(content="")
    await msg.send()

    # 如果 ID 无效 (None)，强制切回 Mock
    if not thread_id or str(thread_id) == "None":
        is_mock_mode = True

    try:
        # 如果是本地 Mock 模式
        if is_mock_mode:
            emojis = ["(✿◡‿◡)", "(>‿◠)✌", "(｡♥‿♥｡)", "(/≧▽≦)/", "(ง •_•)ง"]
            emoji = random.choice(emojis)
            response_text = f"【模拟回复 - API 未连接或出错】\nThread ID: {thread_id}\n收到指令：{content}\n{emoji}"
            for char in response_text:
                await msg.stream_token(char)
        else:
            # 真实 API 调用
            message_content = []
            
            # 1. 文本
            if content:
                message_content.append({"type": "text", "text": content})
                
            # 2. 多模态 (图片)
            if message.elements:
                for element in message.elements:
                    if isinstance(element, (cl.Image, cl.File)):
                        if element.path:
                            with open(element.path, "rb") as f:
                                file_content = f.read()
                        elif element.content:
                            file_content = element.content
                        else:
                            continue
                            
                        b64_content = base64.b64encode(file_content).decode('utf-8')
                        mime = getattr(element, "mime", "application/octet-stream")

                        if "image" in mime:
                            message_content.append({
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime};base64,{b64_content}"
                                }
                            })
                        else:
                            message_content.append({
                                "type": "text",
                                "text": f"\n[Attachment: {element.name} ({mime})]"
                            })

            input_data = {
                "messages": [
                    {
                        "role": "human",
                        "content": message_content if len(message_content) > 1 else content
                    }
                ]
            }
            
            # 非流式验证：直接等待结果，避免 SSE 解析差异
            result = await client.run_wait(thread_id=thread_id, assistant_id=assistant_id, input_data=input_data, token=token)
            out_text = ""
            if isinstance(result, dict):
                if "messages" in result and isinstance(result["messages"], list):
                    for m in result["messages"]:
                        if isinstance(m, dict) and m.get("type") in ("ai", "assistant"):
                            c = m.get("content")
                            if isinstance(c, str):
                                out_text = c
                            elif isinstance(c, list):
                                parts = []
                                for item in c:
                                    if isinstance(item, dict) and item.get("type") == "text":
                                        parts.append(item.get("text", ""))
                                    elif isinstance(item, str):
                                        parts.append(item)
                                out_text = "".join(parts)
                elif "error" in result:
                    out_text = f"错误：{result['error']}"
            if not out_text:
                out_text = json.dumps(result, ensure_ascii=False)
            for ch in out_text:
                await msg.stream_token(ch)

    except Exception as e:
        error_msg = f"\n\n❌ Error: {str(e)}"
        await msg.stream_token(error_msg)
        print(f"Stream Error: {e}") # 打印详细错误到后台
    
    await msg.update()
