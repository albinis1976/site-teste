
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessMap, setAccessMap] = useState({});
  const [accessResolving, setAccessResolving] = useState(false);
  const [processingCourseId, setProcessingCourseId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await courseService.getAll();
    setCourses(fetchedCourses);
  } catch (err) {
    setError('Não foi possível carregar os cursos no momento.');
  } finally {
    setLoading(false);
  }
};
fetchCourses();
}, [user]);

const handleEnroll = async (courseId) => {
if (!user) {
  navigate('/login');
  return;
}

setProcessingCourseId(courseId);
try {
  const data = await courseService.createCheckoutSession(courseId);
  if (data && data.checkout_url) {
    window.location.href = data.checkout_url;
  } else {
    alert('Checkout iniciado! Link: ' + (data?.checkout_url || 'Simulação de pagamento'));
    setProcessingCourseId(null);
  }
} catch (err) {
  if (err.response?.status === 400) {
    alert(err.response.data?.detail || 'Você já possui acesso a este curso ou regras de negócio impedem a compra.');
  } else {
    alert('Erro ao iniciar conexão com o Stripe. Tente novamente.');
  }
  setProcessingCourseId(null);
}
};

const renderActionButton = (course) => {
// Preferimos o slug para URLs amigáveis, fallback para ID
const routeParam = course.slug || course.id;

if (course.is_free) {
  return (
    <button onClick={() => navigate(`/player/${routeParam}`)} className="btn btn-primary">
      Começar Curso
    </button>
  );
}

if (!user) {
  return (
    <button onClick={() => handleEnroll(course.id)} className="btn btn-primary">
      Comprar Curso
    </button>
  );
}

// Usando is_locked fornecido pelo backend
if (!course.is_locked) {
  return (
    <button onClick={() => navigate(`/player/${routeParam}`)} className="btn btn-primary" style={{ background: '#10b981' }}>
      Continuar Curso
    </button>
  );
}

    const isProcessing = processingCourseId === course.id;

    return (
        <button onClick={() => handleEnroll(course.id)} disabled={isProcessing} className="btn btn-primary" style={{ opacity: isProcessing ? 0.7 : 1 }}>
          {isProcessing ? 'Processando...' : 'Comprar Curso'}
        </button>
    );
  };

  return (
    <main>
      <section className="hero-page">
        <div className="container">
          <h1>Nossos Cursos</h1>
          <p>Escolha o caminho ideal para a sua fluência em inglês. Metodologia imersiva com professores nativos.</p>
        </div>
      </section>

      <section>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div className="loader" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-color)' }}>Carregando cursos incríveis...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'var(--danger-color)', padding: '50px' }}>
              <h3>{error}</h3>
              <button onClick={() => window.location.reload()} className="btn btn-outline" style={{ marginTop: '20px' }}>Tentar Novamente</button>
            </div>
          ) : (
            <div className="grid">
              {courses.length > 0 ? courses.map((course) => (
                <div key={course.id} className="card animate-fade-in">
                  <div className="card-img">
                    {course.thumbnail ? <img src={course.thumbnail} alt={course.title} /> : '📚'}
                  </div>
                  <div className="card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div className="badge badge-accent">
                        {course.level || 'Todos os níveis'}
                      </div>
                      {course.is_locked && (
                        <div className="badge" style={{ background: '#f87171', color: '#7f1d1d', marginLeft: '10px' }}>
                          🔒 Bloqueado
                        </div>
                      )}
                    </div>
                    <h3 className="card-title">{course.title}</h3>
                    <p className="card-desc">
                      {course.description?.substring(0, 120)}...
                    </p>
                  </div>
                  <div className="card-footer">
                    <div className="price">
                      {course.is_free ? 'Gratuito' : `R$ ${course.price}`}
                      {!course.is_free && <span>/mês</span>}
                    </div>
                    {renderActionButton(course)}
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
                  <p className="text-muted">Nenhum curso disponível no momento. Volte em breve!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Courses;
