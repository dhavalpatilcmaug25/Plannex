import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [location, setLocation] = useState('');
    const { register, verifyOtp, resendOtp, login } = useAuth(); // Added login for post-verify
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // OTP State
    const [step, setStep] = useState(1); // 1: Register, 2: OTP
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(0);

    // Timer Logic
    React.useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const nameRegex = /^[a-zA-Z\s]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!name.trim()) errors.name = "Name is required";
        else if (name.length < 3 || name.length > 20) errors.name = "Name must be between 3 and 20 characters";
        else if (!nameRegex.test(name)) errors.name = "Name must contain only letters";

        if (!email.trim()) errors.email = "Email is required";
        else if (!emailRegex.test(email)) errors.email = "Invalid email format";

        if (!password) errors.password = "Password is required";
        else if (!passwordRegex.test(password)) errors.password = "Password must use uppercase, lowercase, number, and special char";

        if (!location.trim()) errors.location = "Location/City is required";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password, role, location);
            toast.success("OTP sent to your email!");
            setStep(2); // Move to OTP step
            setTimer(58); // Start 58s timer as requested
        } catch (err) {
            const errorMsg = err.response?.data || "Registration failed. Please try again.";
            toast.error(errorMsg);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await verifyOtp(email, otp);
            toast.success("Account verified successfully!");

            // Auto login after verification
            await login(name, password); // Re-login to get token if verify doesn't return it automatically (context handles login call)
            // Wait, login is async and updates state. context login updates state.

            // Redirect based on role
            if (role === 'customer') navigate('/customer/dashboard');
            else if (role === 'vendor') navigate('/vendor/dashboard');
            else if (role === 'admin') navigate('/admin/dashboard');
        } catch (err) {
            const errorMsg = err.message || "Invalid OTP. Please try again.";
            toast.error(errorMsg);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        setLoading(true);
        try {
            await resendOtp(email);
            toast.success("OTP resent successfully!");
            setTimer(58);
        } catch (err) {
            toast.error("Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center py-5 position-relative flex-grow-1">
            {/* Background */}
            <div className="position-absolute w-100 h-100 bg-body">
                <div className="position-absolute top-0 start-0 w-100 h-50 bg-secondary opacity-10" style={{ borderBottomRightRadius: '50%', borderBottomLeftRadius: '50%' }}></div>
            </div>

            <Container style={{ maxWidth: step === 1 ? '500px' : '400px', zIndex: 1, transition: 'all 0.3s ease' }}>
                <div className="card-glass p-5 animate-fade-in text-center">
                    <div className="mb-4">
                        <i className={`bi ${step === 1 ? 'bi-rocket-takeoff-fill' : 'bi-shield-lock-fill'} text-primary`} style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h2 className="fw-bold mb-1">{step === 1 ? 'Create Account' : 'Verify Email'}</h2>
                    <p className="text-muted mb-4">{step === 1 ? 'Join Plannex to start your journey.' : `Enter the OTP sent to ${email}`}</p>

                    {error && <Alert variant="danger" className="text-start small py-2">{error}</Alert>}

                    {step === 1 ? (
                        <Form onSubmit={handleRegister} className="text-start">
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-uppercase text-secondary">Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form-input bg-white"
                                    isInvalid={!!fieldErrors.name}
                                />
                                <Form.Control.Feedback type="invalid">{fieldErrors.name}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-uppercase text-secondary">Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input bg-white"
                                    isInvalid={!!fieldErrors.email}
                                />
                                <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-uppercase text-secondary">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input bg-white"
                                    isInvalid={!!fieldErrors.password}
                                />
                                <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-uppercase text-secondary">City/Location</Form.Label>
                                <Form.Label className="small fw-bold text-uppercase text-secondary">City/Location</Form.Label>
                                <Form.Select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="form-input bg-white"
                                    isInvalid={!!fieldErrors.location}
                                >
                                    <option value="">Select City</option>
                                    <option value="Mumbai">Mumbai</option>
                                    <option value="Pune">Pune</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Bangalore">Bangalore</option>
                                    <option value="Hyderabad">Hyderabad</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{fieldErrors.location}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-uppercase text-secondary">I am a</Form.Label>
                                <Form.Select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="form-input bg-white"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="customer">Customer (I want to book events)</option>
                                    <option value="vendor">Vendor (I offer services)</option>
                                </Form.Select>
                            </Form.Group>

                            <Button variant="primary" type="submit" className="btn-primary w-100 py-2 border-0" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                        </Form>
                    ) : (
                        <Form onSubmit={handleVerifyOtp} className="text-start">
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-uppercase text-secondary">One-Time Password</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="form-input bg-white text-center fs-4 letter-spacing-2"
                                    maxLength={6}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="btn-primary w-100 py-2 border-0 mb-3" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </Button>

                            <div className="text-center">
                                <p className="mb-0 text-muted small">
                                    Didn't receive the code? <br />
                                    <button
                                        type="button"
                                        className={`btn btn-link p-0 text-decoration-none ${timer > 0 ? 'text-muted' : 'text-primary fw-bold'}`}
                                        onClick={handleResendOtp}
                                        disabled={timer > 0 || loading}
                                        style={{ fontSize: '0.9rem' }}
                                    >
                                        {timer > 0 ? `Resend available in ${formatTime(timer)}` : 'Resend OTP'}
                                    </button>
                                </p>
                                <button type="button" className="btn btn-link text-muted small mt-2 text-decoration-none" onClick={() => setStep(1)}>
                                    Change Email
                                </button>
                            </div>
                        </Form>
                    )}

                    {step === 1 && (
                        <div className="mt-4 pt-3 border-top">
                            <p className="small text-muted mb-0">
                                Already have an account? <Link to="/login" className="fw-bold text-primary">Sign in here</Link>
                            </p>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default Register;
