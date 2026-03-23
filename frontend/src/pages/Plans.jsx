
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Plans = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(1); // Default to middle plan

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      name: 'Básico',
      subtitle: 'Ideal para explorar a plataforma',
      price: '97',
      features: [
        { text: 'Acesso a 1 curso ativo', check: true },
        { text: 'Aulas em vídeo HD', check: true },
        { text: 'Material em PDF', check: true },
        { text: 'Suporte por email', check: true },
        { text: 'Conversação ao vivo', check: false },
        { text: 'Certificado oficial', check: false },
        { text: 'Mentoria individual', check: false },
      ],
      btnClass: 'btn-outline',
      btnText: 'Começar Agora'
    },
    {
      name: 'Pro',
      subtitle: 'Para quem leva o inglês a sério',
      price: '197',
      features: [
        { text: 'Acesso a todos os cursos', check: true },
        { text: 'Aulas em vídeo HD', check: true },
        { text: 'Material em PDF + Áudios', check: true },
        { text: 'Suporte prioritário 24h', check: true },
        { text: '4 aulas de conversação/mês', check: true },
        { text: 'Certificado oficial', check: true },
        { text: 'Mentoria individual', check: false },
      ],
      btnClass: 'btn-accent',
      btnText: 'Assinar Pro'
    },
    {
      name: 'Elite',
      subtitle: 'Fluência garantida ou reembolso',
      price: '397',
      features: [
        { text: 'Acesso ilimitado a tudo', check: true },
        { text: 'Aulas em vídeo 4K', check: true },
        { text: 'Todo material disponível', check: true },
        { text: 'Suporte VIP 24/7', check: true },
        { text: 'Conversação ilimitada', check: true },
        { text: 'Certificado oficial', check: true },
        { text: '2 mentorias individuais/mês', check: true },
      ],
      btnClass: 'btn-primary',
      btnText: 'Assinar Elite'
    }
  ];

  const faqs = [
    { q: 'Posso cancelar minha assinatura a qualquer momento?', a: 'Sim! Não há contratos. Você pode cancelar diretamente no painel do aluno e não será cobrado no próximo ciclo.' },
    { q: 'Os certificados são reconhecidos no mercado?', a: 'Nossos certificados digitais são emitidos conforme padrões internacionais e amplamente aceitos por empresas.' },
    { q: 'Como funcionam as aulas de conversação ao vivo?', a: 'Nas aulas ao vivo você se conecta com um professor via videochamada diretamente pelo nosso painel.' },
    { q: 'Existe uma versão de teste gratuita?', a: 'Sim! Ao criar sua conta você tem acesso às primeiras aulas de qualquer curso gratuitamente.' }
  ];

  return (
    <main>
      <section className="hero-page">
        <div className="container">
          <h1>Invista no seu Inglês</h1>
          <p>Planos flexíveis para todos os perfis. Sem contratos de fidelidade. 7 dias de garantia total.</p>
        </div>
      </section>

      <section style={{ backgroundColor: 'var(--background-color)' }}>
        <div className="container">
          <div className="pricing-grid-improved">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`pricing-card-modern ${hoveredPlan === i ? 'featured' : ''} animate-fade-in`} 
                onMouseEnter={() => setHoveredPlan(i)}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="popular-badge">{i === 1 ? 'Mais Popular' : 'Melhor Escolha'}</div>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-subtitle">{plan.subtitle}</p>
                <div className="plan-price">
                  <span className="currency">R$</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/mês</span>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feat, j) => (
                    <li key={j}>
                      <span className={feat.check ? 'check' : 'cross'}>{feat.check ? '✓' : '✗'}</span>
                      {feat.text}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`btn ${plan.btnClass}`} style={{ width: '100%' }}>
                  {plan.btnText}
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)', fontSize: '15px' }}>
            💳 Pagamento seguro via cartão de crédito ou PIX • Cancele quando quiser
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Perguntas Frequentes</h2>
          </div>
          <div className="faq-wrapper" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} style={{ marginBottom: '15px', border: '2px solid #edf2f7', borderRadius: '12px', overflow: 'hidden' }}>
                <div 
                  className="faq-question" 
                  onClick={() => toggleFaq(i)}
                  style={{ padding: '20px 25px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', background: 'white' }}
                >
                  {faq.q}
                  <span style={{ transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                </div>
                {openFaq === i && (
                  <div className="faq-answer" style={{ padding: '0 25px 20px', color: 'var(--text-muted)', fontSize: '15px', background: 'white' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .pricing-grid-improved {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
        }
        .pricing-card-modern {
            background: white;
            border-radius: 24px;
            padding: 50px 40px;
            box-shadow: var(--box-shadow);
            text-align: center;
            position: relative;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 2px solid transparent;
        }
        .pricing-card-modern:hover {
            transform: translateY(-15px) scale(1.05);
            box-shadow: 0 30px 60px rgba(13, 33, 63, 0.15);
            border-color: var(--accent-color);
            background: linear-gradient(to bottom, white, #fffdfa);
            z-index: 5;
        }
        .pricing-card-modern.featured {
            border-color: var(--accent-color);
            background: linear-gradient(to bottom, white, #fffdfa);
            transform: scale(1.02);
            z-index: 2;
        }
        .popular-badge {
            position: absolute;
            top: -15px; left: 50%; transform: translateX(-50%);
            background: var(--grad-accent);
            color: white; padding: 6px 20px; border-radius: 30px;
            font-size: 13px; font-weight: 800; text-transform: uppercase;
            opacity: 0;
            transition: all 0.3s;
        }
        .pricing-card-modern:hover .popular-badge,
        .pricing-card-modern.featured .popular-badge {
            opacity: 1;
            top: -20px;
        }
        .plan-name { font-size: 26px; margin-bottom: 10px; }
        .plan-subtitle { color: var(--text-muted); font-size: 15px; margin-bottom: 30px; }
        .plan-price { margin-bottom: 35px; }
        .currency { font-size: 20px; font-weight: 800; vertical-align: top; margin-top: 10px; display: inline-block; }
        .amount { font-size: 64px; font-weight: 900; color: var(--primary-color); line-height: 1; }
        .period { color: var(--text-muted); font-size: 16px; font-weight: 600; }
        .plan-features { list-style: none; text-align: left; margin-bottom: 40px; padding: 0; }
        .plan-features li { padding: 12px 0; border-bottom: 1px solid #f0f4f8; font-size: 15px; display: flex; align-items: center; gap: 12px; }
        .check { color: var(--success-color); font-weight: 900; }
        .cross { color: #cbd5e0; font-weight: 900; }
      `}</style>
    </main>
  );
};

export default Plans;
