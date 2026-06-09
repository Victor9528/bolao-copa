import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { GroupDetail } from './pages/GroupDetail'
import { Groups } from './pages/Groups'
import { JoinGroup } from './pages/JoinGroup'
import { Login } from './pages/Login'
import { Matches } from './pages/Matches'
import { Profile } from './pages/Profile'
import { Ranking } from './pages/Ranking'
import { Register } from './pages/Register'
import { Rules } from './pages/Rules'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/grupos" element={<Groups />} />
          <Route path="/grupos/:id" element={<GroupDetail />} />
          <Route path="/grupos/entrar/:code" element={<JoinGroup />} />
          <Route path="/grupos/entrar" element={<JoinGroup />} />
          <Route path="/jogos" element={<Matches />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/regulamento" element={<Rules />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
