import React, { useState, useEffect } from 'react';
import { Table, Badge, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import reviewService from '../../services/reviewService';
import { toast } from 'react-toastify';

const CustomerBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewContent, setReviewContent] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    // Payment Details Modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/booking/my-bookings');
            setBookings(response.data);
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError("Failed to load your bookings.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReview = (booking) => {
        setSelectedBooking(booking);
        setRating(5);
        setReviewContent("");
        setShowReviewModal(true);
    };

    const handleViewPayment = (booking) => {
        setSelectedPayment(booking);
        setShowPaymentModal(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedBooking) return;
        setSubmittingReview(true);
        try {
            // Check if vendor object exists, otherwise might be vendorId (but backend returns full object mostly)
            const vendorId = selectedBooking.event?.vendor?.id || selectedBooking.vendor?.id;

            if (!vendorId) {
                toast.error("Could not identify vendor for this booking.");
                return;
            }

            await reviewService.createReview({
                vendorId: vendorId,
                content: reviewContent,
                rating: rating
            });
            toast.success("Review submitted successfully!");
            setShowReviewModal(false);
        } catch (err) {
            console.error("Review submission failed", err);
            toast.error(err.response?.data || "Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
                &larr; Back
            </Button>
            <h2 className="fw-bold mb-4">My Bookings</h2>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <Card className="card-modern border-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 border-0">Date</th>
                                <th className="py-3 border-0">Event / Service</th>
                                <th className="py-3 border-0">Vendor</th>
                                <th className="py-3 border-0">Amount</th>
                                <th className="py-3 border-0">Status</th>
                                <th className="py-3 border-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">No bookings found.</td>
                                </tr>
                            ) : (
                                bookings.map((b, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-4 fw-medium">
                                            {b.event?.date ? new Date(b.event.date).toLocaleDateString() : (b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'N/A')}
                                        </td>
                                        <td>{b.event?.title || 'Event'}</td>
                                        <td>{b.event?.vendor?.businessName || b.event?.vendor?.username || 'Vendor'}</td>
                                        <td>₹{b.amount || 5000}</td>
                                        <td>
                                            <Badge
                                                bg={b.status === 'CONFIRMED' || b.status === 'PAID' ? 'success' : b.status === 'CANCELLED' ? 'danger' : 'warning'}
                                                className="rounded-pill px-3"
                                            >
                                                {b.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Button size="sm" variant="outline-info" onClick={() => handleViewPayment(b)}>
                                                    View Payment
                                                </Button>
                                                {(b.status === 'CONFIRMED' || b.status === 'PAID') && (
                                                    <Button size="sm" variant="outline-primary" onClick={() => handleOpenReview(b)}>
                                                        Leave Review
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card>
            )}

            {/* Review Modal */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Rate & Review Vendor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Rating</Form.Label>
                            <div className="d-flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        style={{ cursor: 'pointer', fontSize: '1.5rem', color: star <= rating ? '#ffc107' : '#e4e5e9' }}
                                        onClick={() => setRating(star)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Your Review</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                                placeholder="Share your experience..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmitReview} disabled={submittingReview}>
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Payment Details Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Payment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <div>
                            <p><strong>Booking ID:</strong> #{selectedPayment.id}</p>
                            <p><strong>Event:</strong> {selectedPayment.event?.title}</p>
                            <p><strong>Vendor:</strong> {selectedPayment.event?.vendor?.businessName || selectedPayment.event?.vendor?.username}</p>
                            <p><strong>Amount Paid:</strong> ₹{selectedPayment.amount}</p>
                            <p><strong>Payment Date:</strong> {new Date(selectedPayment.bookingDate).toLocaleString()}</p>
                            <p><strong>Status:</strong> <Badge bg="success">PAID</Badge></p>
                            <hr />
                            <p className="small text-muted">Transaction secure. Keep this for your records.</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Close</Button>
                    <Button variant="primary" onClick={() => window.print()}>Print Receipt</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CustomerBookings;
