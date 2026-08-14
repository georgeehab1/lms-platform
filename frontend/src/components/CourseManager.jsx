import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, Plus, Loader2, Clock, HelpCircle, X, Trash2, Pencil } from 'lucide-react';

export default function CourseManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [lessonData, setLessonData] = useState({ title: '', videoUrl: '', content: '', duration: '' });
  const [editingLessonId, setEditingLessonId] = useState(null);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [quizData, setQuizData] = useState({
    title: 'Knowledge Check',
    questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
  });

  useEffect(() => {
    fetchCourseDetails();
    fetchQuizzes();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${id}`);
      const data = await response.json();
      if (response.ok) setCourse(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/quizzes/course/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setQuizzes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditLessonClick = (lesson) => {
    setEditingLessonId(lesson._id);
    setLessonData({
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
      duration: lesson.duration
    });
  };

  const cancelLessonEdit = () => {
    setEditingLessonId(null);
    setLessonData({ title: '', videoUrl: '', content: '', duration: '' });
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${id}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchCourseDetails();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingLessonId 
        ? `http://localhost:5000/api/courses/${id}/lessons/${editingLessonId}` 
        : `http://localhost:5000/api/courses/${id}/lessons`;
      const method = editingLessonId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(lessonData)
      });
      if (response.ok) {
        setLessonData({ title: '', videoUrl: '', content: '', duration: '' });
        setEditingLessonId(null);
        fetchCourseDetails(); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openQuizModal = (lessonId) => {
    setSelectedLessonId(lessonId);
    setIsQuizModalOpen(true);
  };

  const handleAddQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
    });
  };

  const handleRemoveQuestion = (indexToRemove) => {
    const newQs = quizData.questions.filter((_, index) => index !== indexToRemove);
    setQuizData({ ...quizData, questions: newQs });
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          courseId: id,
          lessonId: selectedLessonId,
          title: quizData.title,
          questions: quizData.questions
        })
      });
      if (response.ok) {
        setIsQuizModalOpen(false);
        setQuizData({ title: 'Knowledge Check', questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }] });
        fetchQuizzes();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !course) {
    return <div className="min-h-screen bg-[#FFF6E5] flex justify-center items-center"><Loader2 className="h-10 w-10 text-[#FCD34D] animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#FFF6E5] font-sans text-slate-900 pb-12">
      <div className="pt-6 pb-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm">
            <button onClick={() => navigate('/instructor-dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-4 transition-colors">
              <ArrowLeft className="h-5 w-5" /> Back to Dashboard
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{course.title}</h1>
                <p className="text-slate-500 mt-3 max-w-2xl text-lg">{course.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-2 px-2">
            <PlayCircle className="h-8 w-8 text-[#FCD34D]" /> Curriculum
          </h2>
          
          {course.lessons.map((lesson, index) => {
            const hasQuiz = quizzes.some(q => q.lessonId === lesson._id);
            const isBeingEdited = editingLessonId === lesson._id;
            
            return (
              <div key={lesson._id} className={`bg-white p-6 rounded-[2rem] flex flex-col transition-all shadow-sm ${isBeingEdited ? 'ring-4 ring-[#FCD34D]/50 border-transparent' : 'hover:shadow-md'}`}>
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 h-14 w-14 bg-[#FFF6E5] text-slate-900 rounded-full flex items-center justify-center font-extrabold text-xl">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-extrabold text-slate-900">{lesson.title}</h3>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <button onClick={() => handleEditLessonClick(lesson)} className="p-2 bg-slate-50 text-slate-600 hover:text-blue-600 rounded-full transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteLesson(lesson._id)} className="p-2 bg-slate-50 text-slate-600 hover:text-red-600 rounded-full transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 font-bold">
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#FCD34D]" /> {lesson.duration} mins</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pl-19 flex items-center gap-3">
                  {!hasQuiz ? (
                    <button onClick={() => openQuizModal(lesson._id)} className="px-5 py-2.5 text-sm font-bold text-slate-900 bg-[#FCD34D] hover:bg-[#FBE082] rounded-full transition-colors flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Add Quiz
                    </button>
                  ) : (
                    <span className="px-5 py-2.5 text-sm font-bold text-slate-900 bg-slate-100 rounded-full flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" /> Quiz Added
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="bg-white rounded-[2rem] p-8 sticky top-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">{editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}</h2>
              {editingLessonId && (
                <button onClick={cancelLessonEdit} className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <form onSubmit={handleAddLesson} className="space-y-5">
              <input type="text" required value={lessonData.title} onChange={(e) => setLessonData({...lessonData, title: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all font-medium outline-none" placeholder="Lesson Title" />
              <input type="url" required value={lessonData.videoUrl} onChange={(e) => setLessonData({...lessonData, videoUrl: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all font-medium outline-none" placeholder="Video URL" />
              <input type="number" required min="1" value={lessonData.duration} onChange={(e) => setLessonData({...lessonData, duration: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all font-medium outline-none" placeholder="Duration (mins)" />
              <textarea required rows="4" value={lessonData.content} onChange={(e) => setLessonData({...lessonData, content: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all font-medium outline-none resize-none" placeholder="Description"></textarea>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 flex justify-center items-center text-sm font-extrabold text-white bg-slate-900 rounded-full hover:bg-black disabled:opacity-70 transition-colors mt-2">
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : editingLessonId ? 'Save Changes' : 'Add Lesson'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
              <h2 className="text-2xl font-extrabold text-slate-900">Create Lesson Quiz</h2>
              <button onClick={() => setIsQuizModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="overflow-y-auto p-8 flex-1 bg-[#FFF6E5]/30">
              <form id="quizForm" onSubmit={handleQuizSubmit} className="space-y-8">
                {quizData.questions.map((q, qIndex) => (
                  <div key={qIndex} className="space-y-4 bg-white p-6 rounded-[1.5rem] shadow-sm relative">
                    <div className="flex justify-between items-center">
                      <label className="font-extrabold text-lg text-slate-900">Question {qIndex + 1}</label>
                      {quizData.questions.length > 1 && (
                        <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    
                    <input type="text" required value={q.questionText} onChange={(e) => {
                      const newQs = [...quizData.questions];
                      newQs[qIndex].questionText = e.target.value;
                      setQuizData({...quizData, questions: newQs});
                    }} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all font-medium outline-none" placeholder="Enter question..." />
                    
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {q.options.map((opt, oIndex) => (
                        <input key={oIndex} type="text" required value={opt} onChange={(e) => {
                          const newQs = [...quizData.questions];
                          newQs[qIndex].options[oIndex] = e.target.value;
                          setQuizData({...quizData, questions: newQs});
                        }} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all font-medium outline-none text-sm" placeholder={`Option ${oIndex + 1}`} />
                      ))}
                    </div>
                    
                    <select required value={q.correctAnswer} onChange={(e) => {
                      const newQs = [...quizData.questions];
                      newQs[qIndex].correctAnswer = e.target.value;
                      setQuizData({...quizData, questions: newQs});
                    }} className="w-full mt-4 px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all font-bold outline-none text-sm">
                      <option value="" disabled>Select Correct Answer...</option>
                      {q.options.map((opt, i) => opt && <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
                
                <button type="button" onClick={handleAddQuestion} className="w-full py-4 border-2 border-dashed border-[#FCD34D] text-slate-900 font-extrabold rounded-[1.5rem] hover:bg-[#FCD34D]/10 transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-5 w-5" /> Add Another Question
                </button>
              </form>
            </div>
            
            <div className="px-8 py-6 border-t border-slate-100 bg-white shrink-0">
              <button form="quizForm" type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white font-extrabold rounded-full hover:bg-black disabled:opacity-70 transition-colors">
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Save Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}