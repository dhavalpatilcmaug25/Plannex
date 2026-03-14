import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';


const MyNavbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();


    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar className="navbar-glass sticky-top" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to={user && user.role?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/'} className="d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-event-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                    <span>Plannex</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto fw-medium">
                        {(!user || user.role?.toLowerCase() !== 'admin') && (
                            <Nav.Link as={Link} to="/" className="px-3 text-dark">Home</Nav.Link>
                        )}
                        {user && (
                            <Nav.Link as={Link} to={`/${user.role?.toLowerCase() === 'admin' ? 'admin' : user.role?.toLowerCase() === 'vendor' ? 'vendor' : 'customer'}/dashboard`} className="px-3 text-dark">
                                Dashboard
                            </Nav.Link>
                        )}
                        {(!user || user.role?.toLowerCase() === 'customer') && (
                            <>
                                <Nav.Link as={Link} to="/vendors" className="px-3 text-dark">Explore</Nav.Link>
                            </>
                        )}
                        {user && (user.role?.toLowerCase() === 'vendor' || user.role?.toLowerCase() === 'customer') && (
                            <Nav.Link as={Link} to={user.role?.toLowerCase() === 'vendor' ? '/vendor/chat' : '/customer/chat'} className="px-3 text-dark">Chat</Nav.Link>
                        )}
                    </Nav>
                    <Nav className="d-flex align-items-center gap-2">
                        {!user ? (
                            <>
                                <Button variant="link" className="text-decoration-none text-dark fw-bold" onClick={() => navigate('/login')}>
                                    Log in
                                </Button>
                                <Button className="btn-primary" onClick={() => navigate('/register')}>
                                    Sign up
                                </Button>
                            </>
                        ) : (
                            <div className="d-flex align-items-center gap-3">
                                <div className="text-end d-none d-lg-block">
                                    <div className="fw-bold text-dark small">{user.name}</div>
                                    <div className="text-muted small text-uppercase" style={{ fontSize: '0.7rem' }}>{user.role}</div>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={handleLogout} style={{ borderRadius: '50%' }} title="Logout">
                                    <i className="bi bi-box-arrow-right"></i>
                                </Button>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default MyNavbar;
