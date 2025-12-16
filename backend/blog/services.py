import os
import requests
from django.conf import settings
from rest_framework.exceptions import APIException
import logging

logger = logging.getLogger(__name__)

# Constants
DEFAULT_TIMEOUT = 10
LONG_TIMEOUT = 60
THREAD_TIMEOUT = 15
MAX_LIMIT = 50

class ServiceUnavailable(APIException):
    status_code = 502
    default_detail = '后端服务不可用'
    default_code = 'service_unavailable'

def get_langgraph_base_url():
    return getattr(settings, 'LANGGRAPH_API_URL', 'http://127.0.0.1:2024')

def get_service_headers():
    token = settings.SERVICE_TOKEN_SECRET
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

def create_langgraph_thread(assistant_id, title=None):
    """
    Create a thread in LangGraph service.
    Returns the thread_id.
    """
    api_url = get_langgraph_base_url()
    payload = {'metadata': {'assistant_id': assistant_id}}
    
    try:
        resp = requests.post(
            f'{api_url}/threads', 
            json=payload, 
            headers=get_service_headers(), 
            timeout=THREAD_TIMEOUT
        )
        try:
            data = resp.json()
        except ValueError:
             # Handle non-JSON response
             logger.error(f"Invalid JSON from LangGraph: {resp.text}")
             raise ServiceUnavailable(detail='后端服务返回无效数据')

        thread_id = data.get('thread_id') or data.get('id')
        if not thread_id:
            logger.error(f"Failed to create thread: {data}")
            raise ServiceUnavailable(detail=f'无法创建线程: {data}')
        return thread_id
    except requests.RequestException as e:
        logger.error(f"LangGraph connection error: {e}")
        raise ServiceUnavailable(detail=f'后端线程服务连接失败: {str(e)}')
