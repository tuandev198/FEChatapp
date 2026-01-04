import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const { user } = useAuth();

  return (
    <div className="app">
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/chat" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/chat" /> : <Register />}
        />
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
