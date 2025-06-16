import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Dashboard from './pages/Dashboard.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import MyEventsPage from './pages/MyEventsPage.tsx'
import OrganizerProfilePage from './pages/OrganizerProfilePage.tsx'
import ApplicationsPage from './pages/ApplicationsPage.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<MyEventsPage />} />
          <Route path="/profile" element={<OrganizerProfilePage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
)
