import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const isActive = (path) => {
        return location.pathname === path ? 'bg-primary text-white' : 'text-secondary hover-bg-light';
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSidebar = () => setShowMobileSidebar(!showMobileSidebar);

    // Define sidebar links based on role
    const getLinks = () => {
        if (!user) return [];
        const role = user.role?.toLowerCase() || '';

        if (role === 'customer') {
            return [
                { path: '/customer/dashboard', label: 'Overview', icon: 'bi-speedometer2' },
                { path: '/customer/events', label: 'My Events', icon: 'bi-calendar-event' },
                { path: '/customer/bookings', label: 'Bookings', icon: 'bi-bookmark-check' },
                { path: '/cart', label: 'Cart', icon: 'bi-cart' },
                { path: '/customer/chat', label: 'Messages', icon: 'bi-chat-dots' },
            ];
        } else if (role === 'vendor') {
            return [
                { path: '/vendor/dashboard', label: 'Overview', icon: 'bi-speedometer2' },
                { path: '/vendor/services', label: 'Services', icon: 'bi-grid' },
                { path: '/vendor/events', label: 'Events to Bid', icon: 'bi-search' },
                { path: '/vendor/bookings', label: 'Bookings', icon: 'bi-calendar-check' },
                { path: '/vendor/chat', label: 'Messages', icon: 'bi-chat-dots' },
            ];
        } else if (role === 'admin') {
            return [
                { path: '/admin/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
            ];
        }
        return [];
    };

    const links = getLinks();

    return (
        <div className="d-flex min-vh-100 bg-body">
            {/* Sidebar (Desktop) */}
            <aside className={`bg-white border-end position-fixed h-100 transition-all ${showMobileSidebar ? 'd-block' : 'd-none d-lg-block'}`}
                style={{ width: '260px', zIndex: 1050, top: 0, left: 0 }}>
                <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-calendar2-heart-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                        <span className="fw-bold fs-5 text-dark">Plannex</span>
                    </div>
                    {/* Close button for mobile */}
                    <button className="btn btn-sm btn-ghost d-lg-none" onClick={toggleSidebar}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="p-3">
                    <div className="mb-4 px-3">
                        <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Menu</small>
                    </div>
                    <nav className="nav flex-column gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setShowMobileSidebar(false)} // Close on navigate (mobile)
                                className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-medium transition-all ${isActive(link.path)}`}
                            >
                                <i className={`bi ${link.icon}`}></i>
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="position-absolute bottom-0 w-100 p-3 border-top bg-white">
                    <div className="d-flex align-items-center gap-3 px-3 mb-3">
                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: 40, height: 40 }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <div className="fw-bold text-truncate">{user?.name}</div>
                            <div className="small text-muted text-truncate text-capitalize">{user?.role}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay Backdrop */}
            {showMobileSidebar && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-black opacity-50 d-lg-none"
                    style={{ zIndex: 1040 }}
                    onClick={toggleSidebar}>
                </div>
            )}

            {/* Main Content Info */}
            <div className="flex-grow-1 w-100" style={{ marginLeft: '0' }}>
                <div className="d-lg-block" style={{ marginLeft: '0' }}> {/* Wrapper to handle responsive margin via class if needed, or JS */}
                    {/* We use specific logic: on LG screens, we add margin-left. On small, 0. */}
                    <style>
                        {`
                           @media (min-width: 992px) {
                               .dashboard-main { margin-left: 260px; }
                           }
                           @media (max-width: 991.98px) {
                               .dashboard-main { margin-left: 0; }
                           }
                       `}
                    </style>
                </div>

                <div className="dashboard-main min-vh-100 d-flex flex-column">
                    {/* Topbar (Mobile Only mostly, or global search/notifs) */}
                    <header className="d-lg-none bg-white border-bottom p-3 d-flex align-items-center justify-content-between sticky-top">
                        <div className="fw-bold d-flex align-items-center gap-2">
                            <i className="bi bi-calendar2-heart-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                            <span className="fw-bold fs-5 text-dark">Plannex</span>
                        </div>
                        <button className="btn btn-sm btn-outline-secondary" onClick={toggleSidebar}>
                            <i className="bi bi-list fs-5"></i>
                        </button>
                    </header>

                    <main className="p-4 flex-grow-1">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
