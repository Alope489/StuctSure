import { Routes, Route, Navigate } from 'react-router-dom'
import Loading from './pages/Loading'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import NewPost from './pages/NewPost'
import Notifications from './pages/Notifications'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Loading />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/post/new" element={<NewPost />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
