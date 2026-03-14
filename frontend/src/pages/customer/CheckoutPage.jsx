import React, { useState } from 'react';
import { Container, Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import useAuth from '../../hooks/useAuth';

const CheckoutPage = () => {
    const { user } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const total = getCartTotal();
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success

    const handlePayment = (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        const cardNumber = form.elements['cardNumber'].value;
        const expiry = form.elements['expiry'].value;
        const cvv = form.elements['cvv'].value;

        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) { alert("Invalid Card Number (16 digits required)"); return; }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) { alert("Invalid Expiry (MM/YY)"); return; }
        if (!/^\d{3}$/.test(cvv)) { alert("Invalid CVV (3 digits)"); return; }

        // Mock payment processing
        setTimeout(() => {
            // Create booking records
            const newBookings = cartItems.map(item => ({
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                customerEmail: user ? user.email : 'guest@example.com',
                customerName: user ? user.name : 'Guest User',
                vendorId: item.id,
                vendorName: item.name,
                serviceName: item.category,
                price: item.price,
                date: new Date().toLocaleDateString(),
                status: 'Pending Approval'
            }));

            // Save to local storage
            const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            localStorage.setItem('bookings', JSON.stringify([...existingBookings, ...newBookings]));

            setStep(3);
            clearCart();
        }, 1500);
    };

    if (cartItems.length === 0 && step !== 3) {
        return (
            <Container className="py-5 text-center animate-fade-in">
                <h3>Cart is empty</h3>
                <Button onClick={() => navigate('/vendors')}>Go Back</Button>
            </Container>
        );
    }

    return (
        <Container className="py-5 animate-fade-in" style={{ maxWidth: '800px' }}>
            {step === 1 && (
                <Card className="border-0 shadow-sm p-4">
                    <h3 className="mb-4">Checkout - Billing Details</h3>
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const firstName = form.elements['firstName'].value;
                        const lastName = form.elements['lastName'].value;
                        const phone = form.elements['phone'].value;

                        if (!/^[a-zA-Z]+$/.test(firstName)) { alert("Invalid First Name"); return; }
                        if (!/^[a-zA-Z]+$/.test(lastName)) { alert("Invalid Last Name"); return; }
                        if (!/^\d{10}$/.test(phone)) { alert("Phone must be 10 digits"); return; }

                        setStep(2);
                    }} noValidate>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control name="firstName" type="text" placeholder="John" />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control name="lastName" type="text" placeholder="Doe" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control name="email" type="email" placeholder="john@example.com" defaultValue={user?.email} disabled />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control name="phone" type="tel" placeholder="+91 9876543210" />
                        </Form.Group>
                        <div className="d-flex justify-content-end mt-4">
                            <Button type="submit" variant="primary">Continue to Payment</Button>
                        </div>
                    </Form>
                </Card>
            )}

            {step === 2 && (
                <Card className="border-0 shadow-sm p-4">
                    <h3 className="mb-4">Checkout - Payment</h3>
                    <Alert variant="info">
                        Total Amount: <strong>₹{total.toLocaleString()}</strong>
                    </Alert>
                    <Form onSubmit={handlePayment} noValidate>
                        <Form.Group className="mb-3">
                            <Form.Label>Card Number</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                onChange={(e) => {
                                    if (!/^\d{0,16}$/.test(e.target.value)) return; // Simple input mask
                                    // Real logic would be validation on submit
                                }}
                                name="cardNumber"
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Expiry Date</Form.Label>
                                    <Form.Control type="text" placeholder="MM/YY" name="expiry" />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>CVV</Form.Label>
                                    <Form.Control type="password" placeholder="123" name="cvv" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-between mt-4">
                            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                            <Button type="submit" variant="success">Pay ₹{total.toLocaleString()}</Button>
                        </div>
                    </Form>
                </Card>
            )}

            {step === 3 && (
                <Card className="border-0 shadow-sm p-5 text-center">
                    <div className="mb-3 text-success" style={{ fontSize: '4rem' }}>
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h2 className="mb-3 text-success">Payment Successful!</h2>
                    <p className="lead text-muted">Your services have been booked successfully.</p>
                    <div className="mt-4">
                        <Button variant="primary" onClick={() => navigate('/customer/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </div>
                </Card>
            )}
        </Container>
    );
};

export default CheckoutPage;
