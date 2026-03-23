
import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const posts = [
    {
      title: "Como aprender inglês em 6 meses do zero ao intermediário",
      excerpt: "Descubra o método comprovado que nossas professoras utilizam para acelerar o aprendizado de forma natural e duradoura.",
      category: "Estratégia",
      date: "10 Mar 2026",
      author: "Sarah Mitchell",
      readTime: "8 min",
      emoji: "📚",
      grad: "linear-gradient(135deg,#667eea,#764ba2)"
    },
    {
      title: "10 frases essenciais para reuniões de negócios em inglês",
      excerpt: "Fique confiante em qualquer reunião internacional com essas expressões que os nativos usam todos os dias.",
      category: "Conversação",
      date: "08 Mar 2026",
      author: "James O'Brien",
      readTime: "5 min",
      emoji: "💬",
      grad: "linear-gradient(135deg,#f093fb,#f5576c)"
    },
    {
      title: "IELTS vs TOEFL: qual certificação escolher em 2026?",
      excerpt: "Entenda as diferenças entre os dois exames mais reconhecidos no mundo e descubra o mais adequado para seus objetivos.",
      category: "IELTS & TOEFL",
      date: "05 Mar 2026",
      author: "Emily Carter",
      readTime: "10 min",
      emoji: "🎯",
      grad: "linear-gradient(135deg,#4facfe,#00f2fe)"
    },
    {
      title: "Vocabulário essencial de programação em inglês para devs",
      excerpt: "Git, pull requests, stand-ups, retrospectivas... Domine o inglês técnico que todo desenvolvedor precisa saber.",
      category: "Tech English",
      date: "02 Mar 2026",
      author: "Amanda Brooks",
      readTime: "6 min",
      emoji: "💻",
      grad: "linear-gradient(135deg,#43e97b,#38f9d7)"
    }
  ];

  return (
    <main>
      <section className="hero-page">
        <div className="container">
          <h1>Blog Academy</h1>
          <p>Dicas, estratégias e conteúdo gratuito para alavancar seu inglês de forma consistente.</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="blog-layout">
            <div className="blog-news-grid">
              {posts.map((post, i) => (
                <article key={i} className="blog-item animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="blog-item-img" style={{ background: post.grad }}>{post.emoji}</div>
                  <div className="blog-item-body">
                    <span className="blog-item-cat">{post.category}</span>
                    <h3 className="blog-item-title"><Link to={`/blog/${i}`}>{post.title}</Link></h3>
                    <p className="blog-item-text">{post.excerpt}</p>
                    <div className="blog-item-meta">
                      <span>👤 {post.author}</span>
                      <span>📅 {post.date}</span>
                      <span>⏱ {post.readTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="blog-sidebar">
              <div className="sidebar-card">
                <h4 className="sidebar-title">Categorias</h4>
                <ul className="sidebar-list">
                  {[
                    { n: 'Estratégia', c: 8 },
                    { n: 'Conversação', c: 12 },
                    { n: 'Certificações', c: 5 },
                    { n: 'Tech English', c: 7 }
                  ].map((cat, i) => (
                    <li key={i}>{cat.n} <span className="sidebar-count">{cat.c}</span></li>
                  ))}
                </ul>
              </div>

              <div className="sidebar-card promo" style={{ background: 'var(--grad-primary)', color: 'white' }}>
                <h4 style={{ color: 'white', marginBottom: '10px' }}>Newsletter VIP</h4>
                <p style={{ fontSize: '14px', opacity: '0.9', marginBottom: '20px' }}>Receba dicas exclusivas e materiais gratuitos toda semana.</p>
                <input type="email" placeholder="Seu melhor email" className="form-control" style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
                <button className="btn btn-accent" style={{ width: '100%' }}>Quero Receber</button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <style>{`
        .blog-layout { display: grid; grid-template-columns: 1fr 320px; gap: 40px; }
        .blog-news-grid { display: flex; flex-direction: column; gap: 30px; }
        .blog-item { display: grid; grid-template-columns: 200px 1fr; background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--box-shadow); transition: transform 0.3s; }
        .blog-item:hover { transform: translateY(-5px); box-shadow: var(--box-shadow-hover); }
        .blog-item-img { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 50px; }
        .blog-item-body { padding: 30px; }
        .blog-item-cat { color: var(--accent-color); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
        .blog-item-title { font-size: 22px; margin-bottom: 12px; line-height: 1.4; }
        .blog-item-title a { color: var(--primary-color); }
        .blog-item-title a:hover { color: var(--accent-color); }
        .blog-item-text { color: var(--text-muted); font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
        .blog-item-meta { display: flex; gap: 20px; font-size: 12px; color: var(--text-muted); font-weight: 600; }
        
        .sidebar-card { background: white; border-radius: 20px; padding: 30px; box-shadow: var(--box-shadow); margin-bottom: 30px; }
        .sidebar-title { font-size: 18px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid var(--border-color); }
        .sidebar-list { list-style: none; padding: 0; }
        .sidebar-list li { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f4f8; font-size: 14px; font-weight: 600; }
        .sidebar-count { background: #f0f4f8; color: var(--primary-color); padding: 2px 10px; border-radius: 20px; font-size: 11px; }
        
        @media (max-width: 900px) {
          .blog-layout { grid-template-columns: 1fr; }
          .blog-item { grid-template-columns: 1fr; }
          .blog-item-img { height: 150px; }
        }
      `}</style>
    </main>
  );
};

export default Blog;
