import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">English<span>Academy</span></Link>
            <p>A plataforma mais completa para aprender inglês online com professores nativos certificados. Mais de 5.000 alunos formados em todo o Brasil.</p>
          </div>
          <div className="footer-col">
            <h4>Plataforma</h4>
            <ul>
              <li><Link to="/courses">Cursos</Link></li>
              <li><Link to="/plans">Planos e Preços</Link></li>
              <li><Link to="/teachers">Professores</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Empresa</h4>
            <ul>
              <li><a href="#">Sobre Nós</a></li>
              <li><Link to="/testimonials">Depoimentos</Link></li>
              <li><Link to="/contact">Contato</Link></li>
              <li><a href="#">Trabalhe Conosco</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/terms">Termos de Uso</Link></li>
              <li><Link to="/terms">Política de Privacidade</Link></li>
              <li><Link to="/terms">Política de Reembolso</Link></li>
              <li><Link to="/terms">LGPD</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} English Academy. Todos os direitos reservados.</span>
          <span>Desenvolvido Carlos Ribeiro 🇧🇷</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
