import { useNavigate, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home';
    if (path === '/ticket') {
      return (
        location.pathname.startsWith('/ticket') ||
        location.pathname === '/ticket-purchase' ||
        location.pathname === '/ticket-history' ||
        location.pathname === '/pickup-ticket'
      );
    }
    if (path === '/profile') {
      return (
        location.pathname.startsWith('/profile') ||
        location.pathname === '/settings' ||
        location.pathname === '/saved-trips' ||
        location.pathname === '/favorites' ||
        location.pathname === '/help' ||
        location.pathname === '/payment-methods' ||
        location.pathname === '/ticket-history' ||
        location.pathname === '/pickup-ticket'
      );
    }
    return false;
  };

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <nav className="bottom-nav" aria-label="Hovedmeny">
      <ul>
        <li>
          <a
            href="/home"
            className={isActive('/home') ? 'active' : ''}
            onClick={(e) => handleNavClick('/home', e)}
          >
            <i className="fas fa-bus"></i>
            <span>Reiser</span>
          </a>
        </li>
        <li>
          <a
            href="/ticket"
            className={isActive('/ticket') ? 'active' : ''}
            onClick={(e) => handleNavClick('/ticket', e)}
          >
            <i className="fas fa-ticket-alt"></i>
            <span>Billett</span>
          </a>
        </li>
        <li>
          <a
            href="/profile"
            className={isActive('/profile') ? 'active' : ''}
            onClick={(e) => handleNavClick('/profile', e)}
            data-discover="true"
          >
            <i className="fas fa-user"></i>
            <span>Profil</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Footer;

