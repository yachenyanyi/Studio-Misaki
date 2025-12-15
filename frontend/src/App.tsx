import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ChatRoom from './components/ChatRoom';
import ChatPage from './components/ChatPage';
import ArticleList from './components/ArticleList';
import Footer from './components/Footer';
import Live2D from './components/Live2D';
import ArticleDetail from './components/ArticleDetail';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import Register from './components/Register';
import ToolBar from './components/ToolBar';
import JsonFormatter from './components/tools/JsonFormatter';
import ColorPalette from './components/tools/ColorPalette';
import Base64Converter from './components/tools/Base64Converter';
import PomodoroTimer from './components/tools/PomodoroTimer';
import ImageConverter from './components/tools/ImageConverter';
import EmojiMix from './components/tools/EmojiMix';
import Gallery from './components/Gallery';
import GamePage from './components/Game/GamePage';

function App() {
  return (
    <AuthProvider>
      <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Routes>
                  <Route path="/" element={
                      <>
                          <Hero />
                          <div id="content" className="site-content">
                              <div className="notice">
                                  <i className="fa fa-bullhorn"></i> 欢迎来到 Sakura AI 聊天室，这里是一个安静的角落。
                              </div>
                              <ChatRoom />
                              <ArticleList />
                          </div>
                      </>
                  } />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/article/:id" element={<ArticleDetail />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/tools" element={<ToolBar />} />
                  <Route path="/tools/json-formatter" element={<JsonFormatter />} />
                  <Route path="/tools/color-picker" element={<ColorPalette />} />
                  <Route path="/tools/base64" element={<Base64Converter />} />
                  <Route path="/tools/pomodoro" element={<PomodoroTimer />} />
                  <Route path="/tools/image-converter" element={<ImageConverter />} />
                  <Route path="/tools/emoji-mix" element={<EmojiMix />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/game" element={<GamePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Live2D />
      </Router>
    </AuthProvider>
  );
}

export default App;
