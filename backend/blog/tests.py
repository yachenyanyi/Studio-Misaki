from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import ChatThread
from unittest.mock import patch

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='alice', email='alice@example.com', password='pass1234')
    
    def test_login_username_success(self):
        resp = self.client.post(reverse('login'), {'username':'alice', 'password':'pass1234'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get('is_staff') in (True, False))
        self.assertTrue('token' in resp.json())

    def test_jwt_auth(self):
        # 1. Login to get token
        resp = self.client.post(reverse('login'), {'username':'alice', 'password':'pass1234'}, format='json')
        token = resp.json().get('token')
        
        # 2. Use token to access protected view
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        resp = self.client.get(reverse('check_auth'))
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get('is_authenticated'))
        self.assertEqual(resp.json().get('username'), 'alice')
    
    def test_login_email_success(self):
        resp = self.client.post(reverse('login'), {'email':'alice@example.com', 'password':'pass1234'}, format='json')
        self.assertEqual(resp.status_code, 200)
    
    def test_login_user_not_found(self):
        resp = self.client.post(reverse('login'), {'email':'noone@example.com', 'password':'x'}, format='json')
        self.assertEqual(resp.status_code, 401)
        self.assertIn('不存在', resp.json().get('detail',''))
    
    def test_login_wrong_password(self):
        resp = self.client.post(reverse('login'), {'username':'alice', 'password':'wrong'}, format='json')
        self.assertEqual(resp.status_code, 401)
        self.assertIn('密码错误', resp.json().get('detail',''))
    
    def test_check_auth_requires_session(self):
        resp = self.client.get(reverse('check_auth'))
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.json().get('is_authenticated'))

class ThreadTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='bob', email='bob@example.com', password='pass1234')
    
    def test_threads_require_auth(self):
        resp = self.client.get(reverse('chat_threads'))
        self.assertIn(resp.status_code, (401, 403))
    
    @patch('blog.views.create_langgraph_thread')
    def test_create_thread(self, mock_create):
        mock_create.return_value = 'mock-thread-id-123'
        
        # Login first
        resp = self.client.post(reverse('login'), {'username':'bob', 'password':'pass1234'}, format='json')
        token = resp.json().get('token')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        resp = self.client.post(reverse('chat_threads'), {'assistant_id':'role_playing_agent', 'title':'对话一'}, format='json')
        
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['thread_id'], 'mock-thread-id-123')
        self.assertTrue(ChatThread.objects.filter(thread_id='mock-thread-id-123').exists())


# Create your tests here.
