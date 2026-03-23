import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [hoveredPlan, setHoveredPlan] = useState(1); // Default to Intermediário (index 1)

  const courses = [
    { level: 'Iniciante · A1–A2', title: 'Inglês para Iniciantes', desc: 'Aprenda inglês do zero com metodologia moderna. Perfeito para quem nunca estudou o idioma.', emoji: '🌱', price: '99,90', grad: 'linear-gradient(135deg,#667eea,#764ba2)' },
    { level: 'Intermediário · B1–B2', title: 'Inglês Intermediário', desc: 'Eleve seu nível com conversação fluente, gramática avançada e vocabulário de negócios.', emoji: '🚀', price: '149,90', grad: 'linear-gradient(135deg,#f093fb,#f5576c)' },
    { level: 'Avançado · C1–C2', title: 'Inglês Avançado & Business', desc: 'Domine o inglês corporativo e prepare-se para certificações internacionais como IELTS e TOEFL.', emoji: '💼', price: '199,90', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)' }
  ];

  return (
    <main className="home-page">
      {/* ── Hero ── */}
      <section className="hero-main">
        <div className="container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">🌟 Plataforma #1 de Inglês Online no Brasil</div>
            <h1>Conquiste o Mundo com o <span>Inglês Fluente</span></h1>
            <p className="hero-subtitle">
              Sua jornada definitiva para a fluência começa aqui. Metodologia imersiva, 
              professores nativos certificados e um plano de estudos que se adapta a você. 
              Fale com confiança e destrave novas oportunidades globais.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-accent" style={{ fontSize: '17px', padding: '15px 35px' }}>
                Começar Agora — Grátis
              </Link>
              <Link to="/courses" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.35)', fontSize: '17px', padding: '15px 30px' }}>
                Ver Cursos
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="hero-stat-val">+5.000</div>
                <div className="hero-stat-lbl">Alunos formados</div>
              </div>
              <div className="stat-item">
                <div className="hero-stat-val">98%</div>
                <div className="hero-stat-lbl">Satisfação</div>
              </div>
              <div className="stat-item">
                <div className="hero-stat-val">6+</div>
                <div className="hero-stat-lbl">Professores nativos</div>
              </div>
              <div className="stat-item">
                <div className="hero-stat-val">3</div>
                <div className="hero-stat-lbl">Níveis de ensino</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-visual">🎓</div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-works" style={{ backgroundColor: 'var(--background-color)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Como Funciona</h2>
            <p className="section-subtitle">Do cadastro à fluência em 3 passos simples</p>
          </div>
          <div className="grid">
            <div className="card animate-fade-in">
              <div className="card-content" style={{ textAlign: 'center' }}>
                <div className="how-number" style={{ width: '50px', height: '50px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', margin: '0 auto 18px' }}>1</div>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
                <h3 style={{ marginBottom: '10px' }}>Crie sua Conta</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                  Cadastre-se gratuitamente e faça um nível de diagnóstico. Montamos seu plano de estudos personalizado.
                </p>
              </div>
            </div>
            <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="card-content" style={{ textAlign: 'center' }}>
                <div className="how-number" style={{ width: '50px', height: '50px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', margin: '0 auto 18px' }}>2</div>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎬</div>
                <h3 style={{ marginBottom: '10px' }}>Assista e Pratique</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                  Aulas em vídeo HD com professores nativos, exercícios interativos, áudios e materiais complementares.
                </p>
              </div>
            </div>
            <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="card-content" style={{ textAlign: 'center' }}>
                <div className="how-number" style={{ width: '50px', height: '50px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', margin: '0 auto 18px' }}>3</div>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏆</div>
                <h3 style={{ marginBottom: '10px' }}>Certifique-se</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                  Conclua os módulos, ganhe seu certificado verificável e mostre sua fluência para o mercado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="featured-courses">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nossos Cursos</h2>
            <p className="section-subtitle">Do zero à fluência — escolha seu nível</p>
          </div>
          <div className="grid">
            {courses.map((course, i) => (
              <div 
                key={i} 
                className={`card animate-fade-in ${hoveredPlan === i ? 'featured' : ''}`} 
                onMouseEnter={() => setHoveredPlan(i)}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {i === 1 && <div className="popular-badge">Mais Popular</div>}
                <div className="card-img" style={{ background: course.grad }}>{course.emoji}</div>
                <div className="card-content">
                  <div className="badge badge-accent" style={{ marginBottom: '10px' }}>{course.level}</div>
                  <h3 className="card-title">{course.title}</h3>
                  <p className="card-desc">{course.desc}</p>
                </div>
                <div className="card-footer">
                  <div className="price">R$ {course.price}<span>/mês</span></div>
                  <Link to="/courses" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                    Ver Curso
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <Link to="/courses" className="btn btn-outline" style={{ padding: '14px 40px' }}>
              Ver Todos os Cursos →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials" style={{ backgroundColor: 'var(--background-color)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">O que Nossos Alunos Dizem</h2>
          </div>
          <div className="grid">
            {[
              { name: 'Carlos Eduardo', role: 'Dev Full-Stack · SP', text: '"Em 6 meses consegui minha primeira entrevista de emprego em inglês e fui aprovado! Metodologia incrível."', avatar: '👨', grad: 'linear-gradient(135deg,#667eea,#764ba2)' },
              { name: 'Rafael Mendonça', role: 'Estudante · BH', text: '"Passei no IELTS com nota 7.5 após 4 meses de preparação. A professora Emily conhece cada detalhe da prova!"', avatar: '👨', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
              { name: 'Thiago Almeida', role: 'Engenheiro · POA', text: '"Comecei do absoluto zero e em 8 meses já consigo fazer apresentações completas em inglês. Vale cada centavo!"', avatar: '👨', grad: 'linear-gradient(135deg,#fa709a,#fee140)' }
            ].map((t, i) => (
              <div key={i} className="card animate-fade-in" style={{ animationDelay: `${i * 0.2}s`, borderLeft: '4px solid var(--accent-color)' }}>
                <div className="card-content">
                  <div style={{ color: '#FFB800', fontSize: '14px', marginBottom: '15px' }}>★★★★★</div>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '25px', lineHeight: '1.7' }}>{t.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '15px' }}>{t.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section" style={{ padding: '0' }}>
        <div className="cta-banner" style={{ padding: '100px 0', background: 'var(--grad-accent)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: '42px', marginBottom: '15px' }}>Comece Hoje com 7 Dias Grátis</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '20px', marginBottom: '40px' }}>
              Sem cartão de crédito. Sem compromisso. Cancele quando quiser.
            </p>
            <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--accent-color)', fontSize: '18px', padding: '18px 50px', fontWeight: '800', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              Criar Minha Conta Grátis
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .hero-main {
            background: var(--grad-primary);
            min-height: 90vh;
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
            padding: 100px 0;
        }
        .hero-main::before {
            content: '';
            position: absolute;
            top: -100px; right: -100px;
            width: 500px; height: 500px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(247,127,0,0.15), transparent 70%);
            pointer-events: none;
        }
        .hero-content { position: relative; z-index: 2; max-width: 700px; }
        .hero-badge {
            display: inline-block;
            background: rgba(247,127,0,0.15);
            color: var(--accent-color);
            border: 1px solid rgba(247,127,0,0.3);
            border-radius: 30px;
            padding: 8px 20px;
            font-size: 14px;
            font-weight: 800;
            margin-bottom: 30px;
        }
        .hero-main h1 {
            font-size: clamp(40px, 8vw, 68px);
            color: white;
            margin-bottom: 25px;
        }
        .hero-main h1 span { color: var(--accent-color); }
        .hero-subtitle {
            font-size: 20px;
            color: rgba(255,255,255,0.85);
            margin-bottom: 40px;
        }
        .hero-cta { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 60px; }
        .hero-visual {
            position: absolute;
            right: 5%;
            top: 50%;
            transform: translateY(-50%);
            font-size: 250px;
            opacity: 0.1;
            pointer-events: none;
        }
        .hero-stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
            gap: 30px; 
            margin-top: 50px;
            padding-top: 40px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .hero-stat-val { font-size: 36px; font-weight: 900; color: var(--accent-color); display: block; white-space: nowrap; }
        .hero-stat-lbl { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }
        
        @media (max-width: 1024px) { .hero-visual { display: none; } }
        @media (max-width: 768px) {
            .hero-main { padding: 80px 0; text-align: center; }
            .hero-cta { justify-content: center; }
            .hero-stats { grid-template-columns: 1fr 1fr; gap: 20px; }
        }
        @media (max-width: 480px) {
            .hero-stats { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
};

export default Home;
