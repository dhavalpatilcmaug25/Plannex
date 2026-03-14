import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!email.trim()) {
            toast.error("Username or Email is required.");
            setLoading(false);
            return;
        }
        if (!password) {
            toast.error("Password is required.");
            setLoading(false);
            return;
        }

        try {
            const user = await login(email, password);
            toast.success("Login successful!");
            const role = user.role?.toLowerCase();
            if (role === 'customer') navigate('/customer/dashboard');
            else if (role === 'vendor') navigate('/vendor/dashboard');
            else if (role === 'admin') navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            toast.error('Invalid email or password. Please try again.');
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center py-5 position-relative flex-grow-1">
            {/* Background */}
            <div className="position-absolute w-100 h-100 bg-body">
                <div className="position-absolute top-0 start-0 w-100 h-50 bg-primary opacity-10" style={{ borderBottomRightRadius: '50%', borderBottomLeftRadius: '50%' }}></div>
            </div>

            <Container style={{ maxWidth: '450px', zIndex: 1 }}>
                <div className="card-glass p-5 animate-fade-in text-center">
                    <div className="mb-4">
                        <i className="bi bi-person-circle text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h2 className="fw-bold mb-1">Welcome Back</h2>
                    <p className="text-muted mb-4">Please enter your details to sign in.</p>

                    {error && <Alert variant="danger" className="text-start small py-2">{error}</Alert>}

                    <Form onSubmit={handleSubmit} className="text-start" noValidate>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label className="small fw-bold text-uppercase text-secondary">Username or Email</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username or email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                className="form-input bg-white"
                                isInvalid={!!error && error.includes("email")}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formBasicPassword">
                            <Form.Label className="small fw-bold text-uppercase text-secondary">Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError('');
                                }}
                                className="form-input bg-white"
                                isInvalid={!!error && error.includes("Password")}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="btn-primary w-100 py-2 border-0" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </Form>

                    <div className="mt-4 pt-3 border-top">
                        <p className="small text-muted mb-0">
                            Don't have an account? <Link to="/register" className="fw-bold text-primary">Sign up for free</Link>
                        </p>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Login;
