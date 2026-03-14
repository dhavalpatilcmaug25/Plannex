import React, { useState } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import applicationService from '../../services/applicationService';
import eventService from '../../services/eventService';
import bookingService from '../../services/bookingService';
import { toast } from 'react-toastify';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const location = useLocation();
    const { vendorId, vendorName, amount, appId } = location.state || {};

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        setProcessing(true);
        setError(null);

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
            setError('User not authenticated');
            setProcessing(false);
            return;
        }

        await paymentService.initiatePayment(
            amount,
            user.id,
            eventId,
            appId,
            async (payment) => {
                // Payment successful
                try {
                    // Backend has already handled status updates and booking creation
                    toast.success('Payment successful! Booking confirmed.');
                    navigate('/customer/events');
                } catch (err) {
                    console.error('Error in post-payment handler:', err);
                    navigate('/customer/events');
                }
                setProcessing(false);
            },
            (errorMsg) => {
                // Payment failed
                setError(errorMsg);
                toast.error(errorMsg);
                setProcessing(false);
            }
        );
    };

    if (!vendorId || !amount) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">Invalid payment request. Missing required information.</Alert>
                <Button onClick={() => navigate('/customer/events')}>Go Back</Button>
            </Container>
        );
    }

    return (
        <Container className="mt-5 animate-fade-in">
            <Button
                variant="link"
                className="text-muted ps-0 mb-3 text-decoration-none"
                onClick={() => navigate(-1)}
                disabled={processing}
            >
                &larr; Back
            </Button>

            <Card className="card-modern border-0 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">Payment Details</h4>
                </Card.Header>
                <Card.Body className="p-4">
                    {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

                    <div className="mb-4">
                        <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted">Vendor:</span>
                            <strong>{vendorName}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted">Event ID:</span>
                            <strong>#{eventId}</strong>
                        </div>
                        <hr />
                        {location.state?.type === 'ADVANCE' && (
                            <div className="mb-2">
                                <div className="d-flex justify-content-between text-muted small">
                                    <span>Total Price:</span>
                                    <span>₹{(amount * 2).toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between text-success fw-bold">
                                    <span>Advance Payment (50%):</span>
                                    <span>₹{amount.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                        {location.state?.type === 'FULL' && (
                            <div className="mb-2">
                                <div className="d-flex justify-content-between text-muted small">
                                    <span>Total Price:</span>
                                    <span>₹{amount.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between text-success fw-bold mt-2">
                                    <span>Amount to Pay Now:</span>
                                    <span>₹{amount.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                        {location.state?.type === 'FINAL' && (
                            <div className="mb-2">
                                <div className="d-flex justify-content-between text-muted small">
                                    <span>Total Price:</span>
                                    <span>₹{(amount * 2).toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between text-muted small">
                                    <span>Advance Paid:</span>
                                    <span>- ₹{amount.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between text-primary fw-bold mt-2">
                                    <span>Remaining Balance:</span>
                                    <span>₹{amount.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {!location.state.type && (
                            <div className="d-flex justify-content-between">
                                <h5 className="mb-0">Total Amount:</h5>
                                <h5 className="mb-0 text-primary">₹{amount.toLocaleString()}</h5>
                            </div>
                        )}

                        {(location.state?.type === 'ADVANCE' || location.state?.type === 'FINAL' || location.state?.type === 'FULL') && (
                            <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                                <h5 className="mb-0">Amount to Pay Now:</h5>
                                <h5 className="mb-0 text-primary">₹{amount.toLocaleString()}</h5>
                            </div>
                        )}
                    </div>

                    <div className="d-grid gap-2">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handlePayment}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Processing...
                                </>
                            ) : (
                                'Pay with Razorpay'
                            )}
                        </Button>
                    </div>

                    <div className="mt-3 text-center">
                        <small className="text-muted">
                            <i className="bi bi-shield-check me-1"></i>
                            Secure payment powered by Razorpay
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PaymentPage;

