import React from 'react';
import MyNavbar from '../MyNavbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const MainLayout = ({ children }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <MyNavbar />
            <main className="flex-grow-1">
                {/* Render children if provided, otherwise render Outlet for nested routes */}
                {children ? children : <Outlet />}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
