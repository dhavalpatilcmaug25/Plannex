import React from 'react';
import { Container } from 'react-bootstrap';
import MyNavbar from './MyNavbar';

const Layout = ({ children, fullWidth = false }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar is always at the top */}
            <MyNavbar />

            {/* Main Content Area */}
            {/* If fullWidth is true, we remove padding and let children handle width */}
            <main className={`flex-grow-1 ${fullWidth ? 'p-0' : 'py-4'}`}>
                {fullWidth ? (
                    <div className="w-100">{children}</div>
                ) : (
                    <Container>
                        {children}
                    </Container>
                )}
            </main>

            {/* Simple Footer */}
            <footer className="bg-white py-4 mt-auto border-top">
                <Container className="text-center text-muted small">
                    &copy; {new Date().getFullYear()} Plannex. All Rights Reserved.
                </Container>
            </footer>
        </div>
    );
};

export default Layout;
