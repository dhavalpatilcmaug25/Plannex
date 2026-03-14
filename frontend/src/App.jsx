import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import VendorProfile from './pages/VendorProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateEvent from './pages/customer/CreateEvent';
import MyEvents from './pages/customer/MyEvents';
import PaymentPage from './pages/customer/PaymentPage';
import CustomerBookings from './pages/customer/CustomerBookings';

import CustomerPayments from './pages/customer/CustomerPayments';
import Chat from './pages/customer/Chat';
import Reviews from './pages/customer/Reviews';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import AvailableEvents from './pages/vendor/AvailableEvents';
import VendorBookings from './pages/vendor/VendorBookings';
import VendorServices from './pages/vendor/VendorServices';
import VendorChat from './pages/vendor/VendorChat';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes with Main Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/vendors" element={<Explore />} />
            <Route path="/vendor/:id" element={<VendorProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Shopping Flow (kept in MainLayout) */}
            <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path="/customer/payment/:eventId" element={<PaymentPage />} />
            </Route>
          </Route>

          {/* Dashboard Routes (Sidebar Layout) */}

          {/* Customer Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/events/new" element={<CreateEvent />} />
              <Route path="/customer/events" element={<MyEvents />} />
              <Route path="/customer/bookings" element={<CustomerBookings />} />
              <Route path="/customer/payments" element={<CustomerPayments />} />
              <Route path="/customer/chat" element={<Chat />} />
              <Route path="/customer/reviews" element={<Reviews />} />
            </Route>
          </Route>

          {/* Vendor Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/vendor/events" element={<AvailableEvents />} />
              <Route path="/vendor/bookings" element={<VendorBookings />} />
              <Route path="/vendor/services" element={<VendorServices />} />
              <Route path="/vendor/chat" element={<VendorChat />} />
            </Route>
          </Route>

          {/* Admin Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
