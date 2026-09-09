import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import RoutePlanner from './RoutePlanner';
import TicketPurchase from './pages/TicketPurchase';
import Maps from './pages/Maps';
import Ticket from './pages/Ticket';
import TicketHistory from './pages/TicketHistory';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import ProfileDetails from './pages/ProfileDetails';
import EditName from './pages/EditName';
import EditEmail from './pages/EditEmail';
import EditPhone from './pages/EditPhone';
import PaymentMethods from './pages/PaymentMethods';
import SavedTrips from './pages/SavedTrips';
import PickupTicket from './pages/PickupTicket';
import Help from './pages/Help';
import SingleTicket from './pages/SingleTicket';
import PeriodTicket from './pages/PeriodTicket';
import Payment from './pages/Payment';
import TicketSuccess from './pages/TicketSuccess';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/AdminDashboard';
import NotificationSettings from './pages/NotificationSettings';
import ThemeSettings from './pages/ThemeSettings';
import LanguageSettings from './pages/LanguageSettings';
import PrivacySettings from './pages/PrivacySettings';
import AdminUserProfile from './pages/AdminUserProfile';
import { getBasePath } from './utils/config';
import './App.css';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function LoginWrapper({ onLogin }: { onLogin: (username: string) => void }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (token) {
      navigate('/home', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = (username: string) => {
    onLogin(username);
    navigate('/home', { replace: true });
  };

  return <Login onLogin={handleLogin} />;
}

export default function App() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  const basePath = getBasePath();

  return (
    <Router basename={basePath}>
      <Routes>
        <Route path="/login" element={<LoginWrapper onLogin={() => {}} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/home"
          element={<Home onLogout={handleLogout} />}
        />
        <Route
          path="/profile"
          element={<Profile onLogout={handleLogout} />}
        />
        <Route
          path="/routeplanner"
          element={
            <ProtectedRoute>
              <RoutePlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket-purchase"
          element={<TicketPurchase />}
        />
        <Route
          path="/maps"
          element={<Maps />}
        />
        <Route
          path="/ticket/single"
          element={<SingleTicket />}
        />
        <Route
          path="/ticket/period"
          element={
            <ProtectedRoute>
              <PeriodTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/success"
          element={<TicketSuccess />}
        />
        <Route
          path="/ticket"
          element={<Ticket />}
        />
        <Route
          path="/payment"
          element={<Payment />}
        />
        <Route
          path="/ticket-history"
          element={
            <ProtectedRoute>
              <TicketHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/details"
          element={
            <ProtectedRoute>
              <ProfileDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit-name"
          element={
            <ProtectedRoute>
              <EditName />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit-email"
          element={
            <ProtectedRoute>
              <EditEmail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit-phone"
          element={
            <ProtectedRoute>
              <EditPhone />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-methods"
          element={
            <ProtectedRoute>
              <PaymentMethods />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-trips"
          element={
            <ProtectedRoute>
              <SavedTrips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pickup-ticket"
          element={
            <ProtectedRoute>
              <PickupTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute>
              <AdminUserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/notifications"
          element={
            <ProtectedRoute>
              <NotificationSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/theme"
          element={
            <ProtectedRoute>
              <ThemeSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/language"
          element={
            <ProtectedRoute>
              <LanguageSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/privacy"
          element={
            <ProtectedRoute>
              <PrivacySettings />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}
