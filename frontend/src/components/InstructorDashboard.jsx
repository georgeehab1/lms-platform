import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, BookOpen, Presentation, Loader2, X, Users, Pencil, Trash2, Image as ImageIcon, UploadCloud } from 'lucide-react';

export default function InstructorDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    thumbnail: '',
    isPublished: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'instructor' && parsedUser.role !== 'admin') {
        navigate('/student-dashboard');
      } else {
        setUser(parsedUser);
        fetchMyCourses();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://lmsplatform-qla91z3r.b4a.run/api/courses/instructor', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setCourses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openCreateModal = () => {
    setEditingId(null);
    setCourseData({ title: '', description: '', category: '', customCategory: '', thumbnail: '', isPublished: false });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingId(course._id);
    const isStandardCategory = ['Programming', 'Design', 'Business', 'Marketing'].includes(course.category);
    setCourseData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || '',
      category: isStandardCategory ? course.category : 'Other',
      customCategory: isStandardCategory ? '' : course.category,
      isPublished: course.isPublished
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://lmsplatform-qla91z3r.b4a.run/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchMyCourses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setCourseData({...courseData, thumbnail: event.target.result});
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setCourseData({...courseData, thumbnail: event.target.result});
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalCategory = courseData.category === 'Other' ? courseData.customCategory : courseData.category;
    const payload = {
      title: courseData.title,
      description: courseData.description,
      thumbnail: courseData.thumbnail,
      category: finalCategory,
      isPublished: courseData.isPublished
    };

    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `https://lmsplatform-qla91z3r.b4a.run/api/courses/${editingId}` : 'https://lmsplatform-qla91z3r.b4a.run/api/courses';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        fetchMyCourses();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
                <Presentation className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">Instructor Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700 hidden sm:block">
                Hi, {user.name}
              </span>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Courses</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage your curriculum and track student engagement.</p>
          </div>
          <button onClick={openCreateModal} className="flex items-center gap-2 px-6 py-3 bg-[#FCD34D] text-slate-900 font-extrabold rounded-full hover:bg-[#FBE082] transition-colors shadow-sm">
            <Plus className="h-5 w-5" /> Create Course
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-[#FCD34D] animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFF6E5] rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-[#FCD34D]" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't created any courses. Click the button below to start building your first curriculum.</p>
            <button onClick={openCreateModal} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-colors">
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <div key={course._id} className="bg-white rounded-[2rem] overflow-hidden hover:shadow-md transition-shadow group flex flex-col p-2">
                <div className="bg-[#FFF6E5] rounded-[1.5rem] p-6 flex-1 m-2 relative overflow-hidden">
                  {course.thumbnail && (
                    <div className="absolute inset-0 opacity-20 bg-cover bg-center z-0" style={{ backgroundImage: `url(${course.thumbnail})` }}></div>
                  )}
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-[#FCD34D] text-slate-900">
                        {course.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(course)} className="p-2 bg-white text-slate-600 hover:text-blue-600 rounded-full shadow-sm transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(course._id)} className="p-2 bg-white text-slate-600 hover:text-red-600 rounded-full shadow-sm transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold mb-3 ${course.isPublished ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-slate-700 font-medium text-sm line-clamp-2 mb-6">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-900 font-bold bg-white p-3 rounded-xl shadow-sm w-fit">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-[#FCD34D]" /> {course.lessons?.length || 0} Lessons
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-[#FCD34D]" /> {course.studentsEnrolled?.length || 0} Students
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <button onClick={() => navigate(`/manage-course/${course._id}`)} className="w-full py-3 bg-slate-900 rounded-full text-sm font-bold text-white hover:bg-black transition-colors shadow-sm">
                    Manage Curriculum
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-lg overflow-hidden max-h-[95vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h2 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Course Details' : 'Create New Course'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto bg-[#FFF6E5]/30">
              <form id="courseForm" onSubmit={handleSubmitCourse} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Course Thumbnail</label>
                  {!courseData.thumbnail ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[1.5rem] transition-colors cursor-pointer ${isDragging ? 'border-[#FCD34D] bg-[#FFF6E5]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="thumbnail-upload" />
                      <label htmlFor="thumbnail-upload" className="cursor-pointer flex flex-col items-center w-full">
                        <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                        <span className="text-sm font-bold text-slate-600 text-center">Drag and drop an image here, or <span className="text-blue-600 underline">browse</span></span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-slate-100 rounded-[1.5rem] overflow-hidden border border-slate-200 group">
                      <img src={courseData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setCourseData({...courseData, thumbnail: ''})} className="absolute top-3 right-3 p-2 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                  <input type="text" required value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} className="w-full px-5 py-3 border-none bg-white shadow-sm rounded-2xl focus:ring-2 focus:ring-[#FCD34D] outline-none" placeholder="e.g. Advanced MERN Stack Development" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select required value={courseData.category} onChange={(e) => setCourseData({...courseData, category: e.target.value})} className="w-full px-5 py-3 border-none bg-white shadow-sm rounded-2xl focus:ring-2 focus:ring-[#FCD34D] outline-none mb-3">
                    <option value="" disabled>Select a category</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other...</option>
                  </select>
                  {courseData.category === 'Other' && (
                    <input type="text" required value={courseData.customCategory} onChange={(e) => setCourseData({...courseData, customCategory: e.target.value})} className="w-full px-5 py-3 border-2 border-[#FCD34D] bg-white rounded-2xl focus:ring-2 focus:ring-[#FCD34D] outline-none" placeholder="Enter custom category name" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea required rows="3" value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} className="w-full px-5 py-3 border-none bg-white shadow-sm rounded-2xl focus:ring-2 focus:ring-[#FCD34D] outline-none resize-none" placeholder="What will students learn in this course?"></textarea>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="publish" checked={courseData.isPublished} onChange={(e) => setCourseData({...courseData, isPublished: e.target.checked})} className="h-5 w-5 text-[#FCD34D] focus:ring-[#FCD34D] border-slate-300 rounded-md accent-[#FCD34D]" />
                  <label htmlFor="publish" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Publish immediately (students can see it)
                  </label>
                </div>
              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-700 bg-white shadow-sm rounded-full hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button form="courseForm" type="submit" disabled={isSubmitting} className="px-8 py-3 flex items-center justify-center text-sm font-bold text-slate-900 bg-[#FCD34D] rounded-full hover:bg-[#FBE082] disabled:opacity-70 transition-colors shadow-sm">
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : editingId ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}