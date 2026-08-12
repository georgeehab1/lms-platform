import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, GraduationCap, PlayCircle, Loader2, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchCourses();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const courseRes = await fetch('http://localhost:5000/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const courseData = await courseRes.json();
      
      if (courseRes.ok) {
        setCourses(courseData);
        
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const enrolled = courseData
          .filter(course => course.studentsEnrolled.includes(storedUser._id))
          .map(course => course._id);
          
        setEnrolledCourseIds(enrolled);

        const progressPromises = enrolled.map(async (courseId) => {
          const res = await fetch(`http://localhost:5000/api/progress/${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          return { courseId, completed: data.completedLessons?.length || 0 };
        });

        const progressResults = await Promise.all(progressPromises);
        const newProgressData = {};
        
        progressResults.forEach(({ courseId, completed }) => {
          const course = courseData.find(c => c._id === courseId);
          const total = course.lessons?.length || 0;
          newProgressData[courseId] = total > 0 ? Math.round((completed / total) * 100) : 0;
        });
        
        setProgressData(newProgressData);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEnrolledCourseIds([...enrolledCourseIds, courseId]);
        setProgressData(prev => ({ ...prev, [courseId]: 0 }));
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setEnrollingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FFF6E5] font-sans text-slate-900">
      <nav className="bg-transparent sticky top-0 z-10 pt-4 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center bg-white px-6 rounded-full shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="bg-[#FCD34D] p-2 rounded-full">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">Student Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700 hidden sm:block">
                Hi, {user.name}
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
  {/* Left Side: Header Text */}
  <div>
    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
      Tomorrow is for<br />the Taking
    </h1>
    <p className="text-slate-500 mt-4 text-lg max-w-md">
      Discover new skills and enroll in courses created by expert instructors.
    </p>
  </div>

  {/* Right Side: Quick Stats */}
  <div className="hidden lg:flex items-center gap-4">
    <div className="bg-white px-6 py-4 rounded-[1.5rem] shadow-sm border border-slate-50 text-center min-w-[130px]">
      <div className="text-3xl font-extrabold text-slate-900">{enrolledCourseIds.length}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Enrolled</div>
    </div>
    <div className="bg-white px-6 py-4 rounded-[1.5rem] shadow-sm border border-slate-50 text-center min-w-[130px]">
      {/* Calculating total completed lessons across all courses */}
      <div className="text-3xl font-extrabold text-[#FCD34D]">
        {Object.values(progressData).filter(p => p === 100).length}
      </div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Completed</div>
    </div>
  </div>
</div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-[#FCD34D] animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm">
            <BookOpen className="h-12 w-12 text-[#FCD34D] mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-slate-900">No courses available yet</h3>
            <p className="text-slate-500 mt-2">Check back later when instructors publish new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => {
              const isEnrolled = enrolledCourseIds.includes(course._id);
              const progress = progressData[course._id] || 0;
              
              return (
                <div key={course._id} className="bg-white rounded-[2rem] overflow-hidden hover:shadow-md transition-all group flex flex-col p-2">
                  <div className="bg-[#FFF6E5] rounded-[1.5rem] p-6 flex-1 m-2 relative overflow-hidden group-hover:shadow-inner transition-all">
                    {/* Background Thumbnail layer */}
                    {course.thumbnail && (
                       <div className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                            style={{ backgroundImage: `url(${course.thumbnail})` }}>
                            {/* Overlay to ensure text remains readable over images */}
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
                       </div>
                    )}
                    
                    <div className="relative z-10">
                      <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-[#FCD34D] text-slate-900 mb-4 shadow-sm">
                        {course.category}
                      </span>
                      <h3 className="text-2xl font-extrabold text-slate-900 mb-2 line-clamp-2">{course.title}</h3>
                      
                      <div className="flex items-center gap-3 text-sm text-slate-800 font-bold mt-6">
                        <div className="h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center font-extrabold shadow-sm border border-slate-100">
                          {course.instructorId?.name?.charAt(0) || 'I'}
                        </div>
                        <span className="bg-white/80 px-3 py-1 rounded-full">{course.instructorId?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                      <PlayCircle className="h-5 w-5 text-[#FCD34D]" /> {course.lessons?.length || 0} Lessons
                    </span>
                    
                    {isEnrolled ? (
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FCD34D] transition-all" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-slate-900">{progress}%</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/study/${course._id}`)}
                          className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4" /> Start
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrollingId === course._id}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full hover:bg-black disabled:opacity-70 transition-colors text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        {enrollingId === course._id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}