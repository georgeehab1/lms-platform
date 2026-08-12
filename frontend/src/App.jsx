import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import InstructorDashboard from './components/InstructorDashboard'; 
import CourseManager from './components/CourseManager';
import StudentDashboard from './components/StudentDashboard';
import StudyRoom from './components/StudyRoom';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/instructor-dashboard" element={<InstructorDashboard />} /> 
          <Route path="/manage-course/:id" element={<CourseManager />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/study/:id" element={<StudyRoom />} />
          
          {/* <Route path="/student-dashboard" element={<StudentDashboard />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;