import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await courseService.getCourse(courseId);
        
        setIsCheckingAccess(false);
        setCourse(courseData);
        
        let firstValid = null;
        if (courseData.modules?.length > 0) {
          const allLessons = courseData.modules.flatMap(m => m.lessons);
          firstValid = allLessons.find(l => !l.is_locked);
        }
        if (!firstValid && courseData.lessons) {
          firstValid = courseData.lessons.find(l => !l.is_locked);
        }
        setCurrentLesson(firstValid || null);

      } catch (error) {
        navigate('/courses', { replace: true });
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId, navigate]);

  const handleLessonClick = (lesson) => {
    // Agora permitimos a seleção para exibir o CTA de compra
    setCurrentLesson(lesson);
  };

  const handleEnroll = async (courseId) => {
    try {
      const data = await courseService.createCheckoutSession(courseId);
      if (data && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Checkout iniciado! Link: ' + (data?.checkout_url || 'Simulação de pagamento'));
      }
    } catch (err) {
      alert('Erro ao iniciar matrícula. Tente novamente.');
    }
  };

  const handleNextLesson = () => {
    if (!course || !currentLesson) return;
    const allLessons = course.modules?.flatMap(m => m.lessons) || course.lessons || [];
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    } else {
      alert('Você chegou ao fim desta trilha!');
    }
  };

  if (isCheckingAccess) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px', fontWeight: '800', color: '#0d213f' }}>
        Verificando acesso ao curso...
      </div>
    );
  }

  const totalLessons = (course?.modules?.flatMap(m => m.lessons) || course?.lessons || []).length;

  return (
    <div className="player-layout">
      <div className="player-main">
        <header className="player-header">
          <Link to="/dashboard" className="btn-back">← Voltar para o Dashboard</Link>
          <h2>{course?.title}</h2>
        </header>

        <div className="video-container-modern">
          <div className="video-aspect-ratio">
            {currentLesson?.is_locked ? (
              <div className="video-placeholder" style={{ background: 'linear-gradient(45deg, #1e293b, #0f172a)' }}>
                <span className="play-icon" style={{ cursor: 'default' }}>🔒</span>
                <h2>Conteúdo Exclusivo</h2>
                <p>Este material faz parte do curso pago. Matricule-se para desbloquear acesso vitalício.</p>
                <button className="btn btn-primary" onClick={() => handleEnroll(course.id)} style={{ marginTop: '20px' }}>
                  Desbloquear Curso (R$ {course.price})
                </button>
              </div>
            ) : (
              <div className="video-placeholder">
                <span className="play-icon">▶</span>
                <p>O conteúdo '{currentLesson?.title}' apareceria aqui.<br/>(Integração com Vimeo/YouTube)</p>
              </div>
            )}
          </div>
        </div>

        <div className="player-footer-info">
          <h3>{currentLesson?.title || 'Selecione uma aula'}</h3>
          <p>{currentLesson?.content || 'Carregando recursos...'} Nenhuma descrição avançada disponível.</p>
          <div className="player-actions">
            <button className="btn btn-outline" onClick={() => alert('Download do material iniciado!')}>📄 Baixar Material PDF</button>
            <button className="btn btn-accent" onClick={handleNextLesson}>Próxima Aula →</button>
          </div>
        </div>
      </div>

      <aside className="player-sidebar">
        <div className="sidebar-header">
          <h3>Playlist do Curso</h3>
          <span className="course-badge">{totalLessons} aulas no total</span>
        </div>
        <div className="playlist-items">
          {course?.modules?.map(module => (
            <div key={`mod-${module.id}`}>
              <h4 style={{ padding: '15px 30px 5px', fontSize: '13px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                {module.title}
              </h4>
              {module.lessons.map(lesson => (
                <div 
                  key={lesson.id} 
                  className={`playlist-item ${currentLesson?.id === lesson.id ? 'active' : ''}`}
                  onClick={() => handleLessonClick(lesson)}
                  style={{ opacity: lesson.is_locked ? 0.6 : 1 }}
                >
                  <div className="item-status">{lesson.is_locked ? '🔒' : currentLesson?.id === lesson.id ? '▶' : '✅'}</div>
                  <div className="item-info">
                    <h4>{lesson.title}</h4>
                    <span>{lesson.video_url ? '🎬 Vídeo' : '📝 Texto'} {lesson.is_free || lesson.is_preview ? '(Preview)' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {course?.lessons?.filter(l => !l.module).map(lesson => (
            <div 
              key={lesson.id} 
              className={`playlist-item ${currentLesson?.id === lesson.id ? 'active' : ''}`}
              onClick={() => handleLessonClick(lesson)}
              style={{ opacity: lesson.is_locked ? 0.6 : 1 }}
            >
              <div className="item-status">{lesson.is_locked ? '🔒' : currentLesson?.id === lesson.id ? '▶' : '✅'}</div>
              <div className="item-info">
                <h4>{lesson.title}</h4>
                <span>{lesson.video_url ? '🎬 Vídeo' : '📝 Texto'} {lesson.is_free || lesson.is_preview ? '(Preview)' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <style>{`
        .player-layout { display: grid; grid-template-columns: 1fr 350px; height: calc(100vh - 70px); background: #f8fafc; }
        .player-main { padding: 40px; overflow-y: auto; }
        .player-header { display: flex; align-items: center; gap: 30px; margin-bottom: 25px; }
        .btn-back { color: var(--text-color); font-weight: 700; text-decoration: none; font-size: 14px; }
        
        .video-container-modern { background: #000; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .video-aspect-ratio { position: relative; padding-top: 56.25%; }
        .video-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; background: linear-gradient(45deg, #0f172a, #1e293b); }
        .play-icon { font-size: 80px; margin-bottom: 20px; color: var(--accent-color); cursor: pointer; }
        
        .player-footer-info h3 { font-size: 24px; font-weight: 800; margin-bottom: 15px; }
        .player-footer-info p { color: #64748b; margin-bottom: 25px; max-width: 800px; line-height: 1.6; }
        .player-actions { display: flex; gap: 15px; }

        .player-sidebar { background: white; border-left: 1px solid #e2e8f0; display: flex; flex-direction: column; }
        .sidebar-header { padding: 30px; border-bottom: 1px solid #f1f5f9; }
        .sidebar-header h3 { font-size: 18px; margin-bottom: 8px; }
        .course-badge { font-size: 11px; font-weight: 800; background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
        
        .playlist-items { flex: 1; overflow-y: auto; }
        .playlist-item { padding: 20px 30px; display: flex; gap: 15px; cursor: pointer; border-bottom: 1px solid #f8fafc; transition: all 0.2s; }
        .playlist-item:hover { background: #f8fafc; }
        .playlist-item.active { background: #f0f7ff; border-left: 4px solid var(--primary-color); }
        .item-status { font-size: 16px; margin-top: 2px; }
        .item-info h4 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .item-info span { font-size: 12px; color: #94a3b8; font-weight: 600; }

        @media (max-width: 1024px) {
          .player-layout { grid-template-columns: 1fr; height: auto; }
          .player-sidebar { border-left: none; border-top: 1px solid #e2e8f0; }
        }
      `}</style>
    </div>
  );
};

export default CoursePlayer;
