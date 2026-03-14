import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';

const Reviews = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [vendorId, setVendorId] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const data = await reviewService.getMyReviews();
            setReviews(data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewService.postReview({
                vendorId: parseInt(vendorId), // In real app, select from dropdown of past bookings
                rating: parseInt(rating),
                comment
            });
            setShowModal(false);
            setVendorId('');
            setComment('');
            fetchReviews();
        } catch (err) {
            setError("Failed to submit review. Ensure Vendor ID is valid.");
        }
    };

    return (
        <div className="animate-fade-in">
            <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
                &larr; Back
            </Button>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">My Reviews</h2>
                <Button onClick={() => setShowModal(true)}>Write a Review</Button>
            </div>

            {loading ? <Spinner animation="border" /> : (
                <Row className="g-4">
                    <Col md={8}>
                        {reviews.length === 0 ? <p className="text-muted">No reviews yet.</p> : reviews.map(review => (
                            <Card key={review.id} className="card-modern mb-3 border-0">
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <h5 className="fw-bold">Vendor: {review.vendor?.businessName || review.vendor?.username || `ID ${review.vendorId}`}</h5>
                                        <div className="text-warning">{'★'.repeat(review.rating)}</div>
                                    </div>
                                    <p className="text-muted fw-light mb-2">"{review.content}"</p>
                                    <small className="text-muted">Posted on {new Date(review.date).toLocaleDateString()}</small>
                                </Card.Body>
                            </Card>
                        ))}
                    </Col>
                    <Col md={4}>
                        <Card className="card-modern bg-primary text-white border-0">
                            <Card.Body className="p-4">
                                <h5>Why Review?</h5>
                                <p className="opacity-75">Your reviews help other customers make better choices.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Modal for Writing Review */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Write a Review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Vendor ID</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter Vendor ID (e.g. from your bookings)"
                                value={vendorId}
                                onChange={e => setVendorId(e.target.value)}
                                required
                            />
                            <Form.Text className="text-muted">Check your bookings for Vendor ID.</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Rating</Form.Label>
                            <Form.Select value={rating} onChange={e => setRating(e.target.value)}>
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Good</option>
                                <option value="3">3 - Average</option>
                                <option value="2">2 - Poor</option>
                                <option value="1">1 - Terrible</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">Submit Review</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Reviews;
