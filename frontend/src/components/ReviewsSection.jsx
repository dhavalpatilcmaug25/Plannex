import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import reviewService from '../services/reviewService';
import useAuth from '../hooks/useAuth';

const ReviewsSection = ({ vendor }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (vendor?.id) {
            fetchReviews();
        }
    }, [vendor?.id]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await reviewService.getVendorReviews(vendor.id);
            setReviews(data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!user) { alert("Please login to leave a review"); return; }
        if (!newReview.comment.trim()) { alert("Review cannot be empty"); return; }

        try {
            await reviewService.postReview({
                vendorId: vendor.id,
                rating: parseInt(newReview.rating),
                comment: newReview.comment
            });
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
            alert("Review submitted!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Failed to submit review. Connection error or no booking found.");
        }
    };

    return (
        <Row>
            <Col md={7}>
                <h5 className="fw-bold mb-3">Customer Reviews</h5>
                {loading ? <div className="text-center p-3">Loading...</div> : (
                    <>
                        {reviews.length === 0 ? <p className="text-muted">No reviews yet.</p> : reviews.map(review => (
                            <Card key={review.id} className="mb-3 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <h6 className="fw-bold mb-1">{review.user?.username || "Anonymous"}</h6>
                                        <span className="text-warning">{'★'.repeat(review.rating)}</span>
                                    </div>
                                    <p className="mb-0 text-secondary">"{review.content}"</p>
                                </Card.Body>
                            </Card>
                        ))}
                    </>
                )}
            </Col>
            <Col md={5}>
                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        <h5 className="fw-bold mb-3">Leave a Review</h5>
                        <Form onSubmit={handleReviewSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Rating</Form.Label>
                                <Form.Select
                                    value={newReview.rating}
                                    onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                                >
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Comment</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Share your experience..."
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                />
                            </Form.Group>
                            <Button type="submit" variant="primary" className="w-100">Submit Review</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ReviewsSection;
