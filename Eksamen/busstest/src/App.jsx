import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoadingPage from './pages/LoadingPage'
import HomePage from './pages/HomePage'
import TicketPage from './pages/TicketPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import SearchFromPage from './pages/SearchFromPage'
import SearchToPage from './pages/SearchToPage'
import JourneyDetailsPage from './pages/JourneyDetailsPage'
import TicketPurchasePage from './pages/TicketPurchasePage'
import SingleTicketPage from './pages/SingleTicketPage'
import PeriodTicketPage from './pages/PeriodTicketPage'
import PaymentPage from './pages/PaymentPage'
import TicketSuccessPage from './pages/TicketSuccessPage'
import ActiveTicketPage from './pages/ActiveTicketPage'
import TicketHistoryPage from './pages/TicketHistoryPage'
import PaymentMethodsPage from './pages/PaymentMethodsPage'
import AddPaymentMethodPage from './pages/AddPaymentMethodPage'
import ProfileInfoPage from './pages/ProfileInfoPage'
import EditNamePage from './pages/EditNamePage'
import EditPhonePage from './pages/EditPhonePage'
import EditEmailPage from './pages/EditEmailPage'
import SettingsPage from './pages/SettingsPage'
import SavedPlacesPage from './pages/SavedPlacesPage'
import FavoritesPage from './pages/FavoritesPage'
import AddFavoritePage from './pages/AddFavoritePage'
import HelpPage from './pages/HelpPage'
import QuickPurchasePage from './pages/QuickPurchasePage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/ticket" element={<TicketPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/from" element={<SearchFromPage />} />
        <Route path="/search/to" element={<SearchToPage />} />
        <Route path="/journey/:id" element={<JourneyDetailsPage />} />
        <Route path="/ticket/purchase" element={<TicketPurchasePage />} />
        <Route path="/ticket/single" element={<SingleTicketPage />} />
        <Route path="/ticket/period" element={<PeriodTicketPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/ticket/success" element={<TicketSuccessPage />} />
        <Route path="/ticket/active" element={<ActiveTicketPage />} />
        <Route path="/ticket/history" element={<TicketHistoryPage />} />
        <Route path="/payment/methods" element={<PaymentMethodsPage />} />
        <Route path="/payment/methods/add" element={<AddPaymentMethodPage />} />
        <Route path="/profile/info" element={<ProfileInfoPage />} />
        <Route path="/profile/edit/name" element={<EditNamePage />} />
        <Route path="/profile/edit/phone" element={<EditPhonePage />} />
        <Route path="/profile/edit/email" element={<EditEmailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/saved-places" element={<SavedPlacesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/favorites/add" element={<AddFavoritePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/quick-purchase" element={<QuickPurchasePage />} />
      </Routes>
    </Router>
  )
}

export default App

