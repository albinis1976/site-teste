import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalToast from './components/GlobalToast';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';
import Courses from './pages/Courses';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Plans from './pages/Plans';
import Teachers from './pages/Teachers';
import Testimonials from './pages/Testimonials';

// Student Protected Pages
import StudentDashboard from './pages/aluno/StudentDashboard';
import Certificates from './pages/aluno/Certificates';
import Settings from './pages/aluno/Settings';
import Materials from './pages/aluno/Materials';
import MyClasses from './pages/aluno/MyClasses';
import Progress from './pages/aluno/Progress';
import CoursePlayer from './pages/CoursePlayer';

// Teacher Protected Pages
import TeacherDashboard from './pages/professor/TeacherDashboard';
import ManageClasses from './pages/professor/ManageClasses';
import StudentsList from './pages/professor/StudentsList';
import UploadMaterials from './pages/professor/UploadMaterials';

// Admin Protected Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Component to handle conditional Layout
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  // Pages that should NOT have the global Navbar/Footer (Dashboards)
  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/aluno') || 
                      location.pathname.startsWith('/teacher/') || 
                      location.pathname.startsWith('/admin') ||
                      location.pathname.startsWith('/player');

  return (
    <>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <GlobalToast />
      <BrowserRouter>
        <LayoutWrapper>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/testimonials" element={<Testimonials />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/aluno/aulas" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <MyClasses />
            </ProtectedRoute>
          } />
          <Route path="/aluno/progresso" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <Progress />
            </ProtectedRoute>
          } />
          <Route path="/aluno/materiais" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <Materials />
            </ProtectedRoute>
          } />
          <Route path="/aluno/certificados" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <Certificates />
            </ProtectedRoute>
          } />
          <Route path="/aluno/configuracoes" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/player/:courseId" element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <CoursePlayer />
            </ProtectedRoute>
          } />
          
          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher/gestao-aulas" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <ManageClasses />
            </ProtectedRoute>
          } />
          <Route path="/teacher/alunos" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <StudentsList />
            </ProtectedRoute>
          } />
          <Route path="/teacher/upload" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <UploadMaterials />
            </ProtectedRoute>
          } />
          <Route path="/teacher/perfil" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <Settings /> 
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;