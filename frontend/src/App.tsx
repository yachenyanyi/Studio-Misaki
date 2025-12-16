import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ChatRoom from './components/ChatRoom';
import ArticleList from './components/ArticleList';
import Footer from './components/Footer';
import Live2D from './components/Live2D';
import { AuthProvider } from './context/AuthContext';

const ChatPage = lazy(() => import('./components/ChatPage'));
const ArticleDetail = lazy(() => import('./components/ArticleDetail'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const ToolBar = lazy(() => import('./components/ToolBar'));
const JsonFormatter = lazy(() => import('./components/tools/JsonFormatter'));
const ColorPalette = lazy(() => import('./components/tools/ColorPalette'));
const Base64Converter = lazy(() => import('./components/tools/Base64Converter'));
const PomodoroTimer = lazy(() => import('./components/tools/PomodoroTimer'));
const ImageConverter = lazy(() => import('./components/tools/ImageConverter'));
const EmojiMix = lazy(() => import('./components/tools/EmojiMix'));
const Gallery = lazy(() => import('./components/Gallery'));
const GamePage = lazy(() => import('./components/Game/GamePage'));

function App() {
  return (
    <AuthProvider>
      <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Suspense fallback={null}>
                <Routes>
                    <Route path="/" element={
                        <>
                            <Hero />
                            <div id="content" className="site-content">
                                <div className="notice">
                                    <i className="fa fa-bullhorn"></i> 欢迎来到 Studio-Misaki 聊天室，这里是一个安静的角落。
                                </div>
                                <ChatRoom />
                                <ArticleList />
                            </div>
                        </>
                    } />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/login" element={<Login />} />
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
              </Suspense>
            </main>
            <Footer />
          </div>
          <Live2D />
      </Router>
    </AuthProvider>
  );
}

export default App;
