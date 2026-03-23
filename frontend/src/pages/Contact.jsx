
import React, { useState } from 'react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Real API integration would go here
  };

  return (
    <main>
      <section className="hero-page">
        <div className="container">
          <h1>Fale com a Gente</h1>
          <p>Dúvidas, suporte ou parcerias? Nossa equipe está pronta para te atender.</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="contact-wrapper animate-fade-in">
            <div className="contact-info-panel">
              <h2 style={{ marginBottom: '15px' }}>Estamos aqui para ajudar</h2>
              <p className="text-muted" style={{ marginBottom: '40px' }}>Resposta garantida em até 24 horas úteis por nossa equipe de especialistas.</p>

              {[
                { i: '📧', t: 'Email', v: 'suporte@englishacademy.com.br', sm: 'Suporte VIP 24/7' },
                { i: '💬', t: 'WhatsApp', v: '(11) 99999-0000', sm: 'Seg-Sex, 8h-20h' },
                { i: '📍', t: 'Sede', v: 'Av. Paulista, 1374 · SP', sm: 'Vendas e Comercial' }
              ].map((item, i) => (
                <div key={i} className="contact-detail-item">
                  <div className="contact-detail-icon">{item.i}</div>
                  <div>
                    <h4>{item.t}</h4>
                    <p style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{item.v}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.sm}</span>
                  </div>
                </div>
              ))}
              
              <div style={{ marginTop: '40px' }}>
                <h4 style={{ marginBottom: '15px' }}>Redes Sociais</h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Instagram', 'LinkedIn', 'YouTube'].map(social => (
                    <a key={social} href="#" className="btn btn-outline" style={{ padding: '8px 15px', fontSize: '13px' }}>{social}</a>
                  ))}
                </div>
              </div>
            </div>

            <div className="contact-form-panel">
              {submitted ? (
                <div className="success-message text-center">
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                  <h3 style={{ marginBottom: '10px' }}>Mensagem Enviada!</h3>
                  <p className="text-muted">Agradecemos o contato. Responderemos em breve.</p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-primary" style={{ marginTop: '30px' }}>Enviar Outra</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Nome</label>
                      <input type="text" className="form-control" placeholder="Seu nome" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" placeholder="seu@email.com" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assunto</label>
                    <select className="form-control" required>
                      <option value="">Selecione um motivo</option>
                      <option>Dúvidas sobre Cursos</option>
                      <option>Problemas de Acesso</option>
                      <option>Planos e Pagamentos</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mensagem</label>
                    <textarea className="form-control" rows="5" placeholder="Como podemos te ajudar?" required></textarea>
                  </div>
                  <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '15px' }}>Enviar Mensagem</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .contact-wrapper { display: grid; grid-template-columns: 1fr 1.5fr; gap: 60px; }
        .contact-detail-item { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 30px; }
        .contact-detail-icon { width: 50px; height: 50px; border-radius: 12px; background: #f0f4ff; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .contact-form-panel { background: white; border-radius: 24px; padding: 50px; box-shadow: var(--box-shadow); }
        .success-message { padding: 40px 0; }
        @media (max-width: 900px) {
          .contact-wrapper { grid-template-columns: 1fr; }
          .contact-form-panel { padding: 30px; }
        }
      `}</style>
    </main>
  );
};

export default Contact;
