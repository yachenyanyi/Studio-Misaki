import argparse
import json
import sys
import time
from typing import Optional, Dict, Any
import requests

def extract_text(data: Any) -> Optional[str]:
    if data is None:
        return None
    if isinstance(data, dict):
        c = data.get("content")
        if isinstance(c, str):
            return c
        if isinstance(c, list):
            parts = []
            for item in c:
                if isinstance(item, str):
                    parts.append(item)
                elif isinstance(item, dict):
                    if item.get("type") == "text" and isinstance(item.get("text"), str):
                        parts.append(item["text"])
                    elif isinstance(item.get("content"), str):
                        parts.append(item["content"])
            if parts:
                return "".join(parts)
        delta = data.get("delta") or data.get("token")
        if isinstance(delta, str):
            return delta
        return None
    if isinstance(data, str):
        return data
    if isinstance(data, list) and data:
        return extract_text(data[0])
    return None

def login(api_base: str, session: requests.Session, username: str, password: str, auto_register: bool) -> Optional[str]:
    r = session.post(f"{api_base}/auth/login/", json={"username": username, "password": password}, timeout=15)
    if r.status_code == 200:
        data = r.json()
        return data.get("token")
    if auto_register:
        rr = session.post(f"{api_base}/auth/register/", json={"username": username, "password": password}, timeout=15)
        if rr.status_code in (200, 201):
            r2 = session.post(f"{api_base}/auth/login/", json={"username": username, "password": password}, timeout=15)
            if r2.status_code == 200:
                return r2.json().get("token")
    return None

def create_thread(api_base: str, session: requests.Session, token: str, assistant_id: str, title: str) -> Optional[str]:
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json", "Accept": "application/json"}
    r = session.post(f"{api_base}/chatproxy/threads", json={"assistant_id": assistant_id, "title": title}, headers=headers, timeout=20)
    if r.status_code in (200, 201):
        data = r.json()
        return data.get("thread_id") or data.get("id")
    return None

def run_wait(api_base: str, session: requests.Session, token: str, thread_id: str, assistant_id: str, message: str) -> Dict[str, Any]:
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json", "Accept": "application/json"}
    payload = {"assistant_id": assistant_id, "input": {"messages": [{"role": "user", "content": message}]}}
    r = session.post(f"{api_base}/chatproxy/threads/{thread_id}/runs/wait", json=payload, headers=headers, timeout=60)
    try:
        return r.json()
    except Exception:
        return {"error": r.text, "status": r.status_code}

def run_stream(api_base: str, session: requests.Session, token: str, thread_id: str, assistant_id: str, message: str) -> int:
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {"assistant_id": assistant_id, "input": {"messages": [{"role": "user", "content": message}]},"stream_mode":"messages-tuple"}
    try:
        r = session.post(f"{api_base}/chatproxy/threads/{thread_id}/runs/stream", json=payload, headers=headers, stream=True, timeout=60)
    except Exception as e:
        print(f"STREAM_ERROR {e}")
        return 1
    if r.status_code != 200:
        try:
            print(f"STREAM_HTTP_{r.status_code} {r.text}")
        except Exception:
            print(f"STREAM_HTTP_{r.status_code}")
        return r.status_code
    for line in r.iter_lines(decode_unicode=True):
        if not line:
            continue
        s = line.strip()
        if not s.startswith("data:"):
            continue
        raw = s[5:].strip()
        if not raw:
            continue
        try:
            obj = json.loads(raw)
        except Exception:
            print(raw, end="", flush=True)
            continue
        event = None
        data = None
        if isinstance(obj, list) and len(obj) >= 2:
            event = obj[0]
            data = obj[1]
        elif isinstance(obj, dict):
            event = obj.get("event")
            data = obj.get("data")
            if data is None:
                data = obj
            if not event:
                event = (data.get("type") if isinstance(data, dict) else None) or "messages/complete"
        if event and (("heartbeat" in event) or ("metadata" in event) or ("checkpointer" in event)):
            continue
        text = extract_text(data)
        if text:
            print(text, end="", flush=True)
    print()
    return 0

def get_history(api_base: str, session: requests.Session, token: str, thread_id: str) -> Any:
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
    r = session.get(f"{api_base}/chatproxy/threads/{thread_id}/history", headers=headers, timeout=20)
    try:
        return r.json()
    except Exception:
        return {"error": r.text, "status": r.status_code}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", default="http://127.0.0.1:8000/api")
    parser.add_argument("--username", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--assistant", default="intelligent_deep_assistant")
    parser.add_argument("--message", default="Hello")
    parser.add_argument("--mode", choices=["wait","stream"], default="wait")
    parser.add_argument("--thread_id")
    parser.add_argument("--auto_register", action="store_true")
    args = parser.parse_args()

    session = requests.Session()
    token = login(args.api, session, args.username, args.password, args.auto_register)
    if not token:
        print("LOGIN_FAILED")
        sys.exit(1)

    thread_id = args.thread_id
    if not thread_id:
        title = args.message[:30]
        thread_id = create_thread(args.api, session, token, args.assistant, title)
    if not thread_id:
        print("THREAD_CREATE_FAILED")
        sys.exit(2)

    print(f"THREAD_ID {thread_id}")

    if args.mode == "wait":
        result = run_wait(args.api, session, token, thread_id, args.assistant, args.message)
        text = ""
        if isinstance(result, dict):
            if "messages" in result and isinstance(result["messages"], list):
                for m in result["messages"]:
                    if isinstance(m, dict) and (m.get("type") in ("ai","assistant") or m.get("role") == "assistant"):
                        t = extract_text(m)
                        if t:
                            text = t
            elif "error" in result:
                text = f"ERROR {result['error']}"
        if not text:
            text = json.dumps(result, ensure_ascii=False)
        print(text)
    else:
        code = run_stream(args.api, session, token, thread_id, args.assistant, args.message)
        if code != 0:
            sys.exit(code)

    history = get_history(args.api, session, token, thread_id)
    if isinstance(history, list):
        last = None
        for item in history[::-1]:
            if isinstance(item, dict) and (item.get("type") in ("ai","assistant") or item.get("role") == "assistant"):
                last = item
                break
        if last:
            c = extract_text(last)
            print(f"HISTORY_LAST {c}")
        else:
            print(f"HISTORY_LEN {len(history)}")
    else:
        print(f"HISTORY_RESP {json.dumps(history, ensure_ascii=False)}")

if __name__ == "__main__":
    main()
