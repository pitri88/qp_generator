import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./components/Home";
import FacultyDashboard from "./components/TeacherDashboard";
import Login from "./components/Login";
import QuestionPaperForm from "./components/QuestionPaperForm";
import ModifyQB from "./components/ModifyQB";
import AddQuestion from "./components/AddQuestion";
import AdminDashboard from "./components/AdminDashboard";
import CourseView from './components/CourseView';
import PaperGenerator from './components/PaperGenerator';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/home.css';

// Import admin components
import AdminDepartmentForm from "./components/admin/DepartmentForm";
import AdminCourseForm from "./components/admin/CourseForm";
import AdminFacultyForm from "./components/admin/FacultyForm";
import AdminQuestionForm from "./components/admin/QuestionForm";
import FacultyProfile from './components/FacultyProfile';
import AdminDepartmentList from './components/admin/AdminDepartmentList';
import AdminCourseList from './components/admin/AdminCourseList';
import AdminFacultyList from './components/admin/AdminFacultyList';
import AdminQuestionList from './components/admin/AdminQuestionList';
import AdminFacultyCourseAssign from './components/admin/AdminFacultyCourseAssign';
import AdminDepartmentCourseAssign from './components/admin/AdminDepartmentCourseAssign';
import AdminReports from './components/admin/AdminReports';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login-admin" element={<Login user="admin" />} />
        <Route path="/login-faculty" element={<Login user="faculty" />} />
        
        {/* Faculty routes */}
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/create-question-paper/:courseId" element={<QuestionPaperForm />} />
        <Route path="/manage-question-bank/:courseId" element={<ModifyQB />} />
        <Route path="/manage-question-bank/:courseId/add-questions" element={<AddQuestion />} />
        <Route path="/course/:courseId" element={<CourseView />} />
        <Route path="/generate-paper" element={
          <ProtectedRoute>
            <PaperGenerator />
          </ProtectedRoute>
        } />
        <Route path="/faculty/profile" element={
          <ProtectedRoute>
            <FacultyProfile />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin CRUD routes */}
        <Route path="/admin/departments/add" element={
          <ProtectedRoute role="admin">
            <AdminDepartmentForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/departments/:id/edit" element={
          <ProtectedRoute role="admin">
            <AdminDepartmentForm />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/courses/add" element={
          <ProtectedRoute role="admin">
            <AdminCourseForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses/:id/edit" element={
          <ProtectedRoute role="admin">
            <AdminCourseForm />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/faculty/add" element={
          <ProtectedRoute role="admin">
            <AdminFacultyForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/faculty/:id/edit" element={
          <ProtectedRoute role="admin">
            <AdminFacultyForm />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/questions/add" element={
          <ProtectedRoute role="admin">
            <AdminQuestionForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/questions/:id/edit" element={
          <ProtectedRoute role="admin">
            <AdminQuestionForm />
          </ProtectedRoute>
        } />

        {/* New admin routes */}
        <Route path="/admin/departments" element={
          <ProtectedRoute role="admin">
            <AdminDepartmentList />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute role="admin">
            <AdminCourseList />
          </ProtectedRoute>
        } />
        <Route path="/admin/faculty" element={
          <ProtectedRoute role="admin">
            <AdminFacultyList />
          </ProtectedRoute>
        } />
        <Route path="/admin/questions" element={
          <ProtectedRoute role="admin">
            <AdminQuestionList />
          </ProtectedRoute>
        } />
        <Route path="/admin/faculty-course/assign" element={
          <ProtectedRoute role="admin">
            <AdminFacultyCourseAssign />
          </ProtectedRoute>
        } />
        <Route path="/admin/department-course/assign" element={
          <ProtectedRoute role="admin">
            <AdminDepartmentCourseAssign />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute role="admin">
            <AdminReports />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
