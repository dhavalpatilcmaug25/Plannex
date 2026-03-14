import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import vendorService from '../../services/vendorService';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const AvailableEvents = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [appliedEvents, setAppliedEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [quotePrice, setQuotePrice] = useState('');

    const [isProfileComplete, setIsProfileComplete] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        checkProfile();
        fetchEvents();
    }, [user]);

    const checkProfile = async () => {
        try {
            const profile = await vendorService.getMyProfile();
            if (!profile.businessName || !profile.category) {
                setIsProfileComplete(false);
                toast.warn("Please complete your profile to offer services.");
            } else {
                setIsProfileComplete(true);
            }
        } catch (e) {
            console.error("Failed to check profile", e);
        }
    };

    const fetchEvents = async () => {
        try {
            // Get user location from local storage or auth context
            const userStr = localStorage.getItem("user");
            let locationFilter = "";
            if (userStr) {
                const u = JSON.parse(userStr);
                locationFilter = u.location;
            }

            // Pass location filter to backend
            const allEvents = await eventService.getAllEvents({ location: locationFilter });
            setEvents(allEvents);

            // Check which events current vendor has already applied to
            const applied = [];
            allEvents.forEach(e => {
                if (e.applications && e.applications.some(req => req.vendorEmail === user.email)) {
                    applied.push(e.id);
                }
            });
            setAppliedEvents(applied);
        } catch (error) {
            console.error("Failed to fetch events", error);
            toast.error("Failed to load events");
        }
    };

    const initiateApply = (eventId) => {
        if (!isProfileComplete) {
            toast.error("You must complete your profile (Business Name & Category) before applying.");
            navigate('/vendor/dashboard');
            return;
        }
        setSelectedEventId(eventId);
        setQuotePrice('');
        setShowModal(true);
    };

    const handleApply = async () => {
        if (!quotePrice || isNaN(quotePrice) || Number(quotePrice) <= 0) {
            toast.error("Please enter a valid quote price.");
            return;
        }

        try {
            await eventService.applyToEvent(selectedEventId, Number(quotePrice));
            setAppliedEvents([...appliedEvents, selectedEventId]);
            toast.success('Application sent successfully with your quote!');
            setShowModal(false);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data || 'Could not apply. You may have already applied.';
            toast.error(errorMsg);
            setShowModal(false);
        }
    };

    return (
        <Container className="mt-4 animate-fade-in">
            <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate('/vendor/dashboard')}>
                &larr; Back to Dashboard
            </Button>
            <h2 className="mb-4">Available Events</h2>



            {!isProfileComplete && (
                <Alert variant="warning" className="mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Profile Incomplete:</strong> You need to set up your <strong>Business Name</strong> and <strong>Category</strong> before you can offer services.
                    <Link to="/vendor/dashboard" className="ms-2 fw-bold">Go to Dashboard</Link> to update your profile.
                </Alert>
            )}

            <Row>
                {events.map(event => (
                    <Col md={6} lg={4} key={event.id} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-2">
                                    <Badge bg="info">{event.location}</Badge>
                                    <small className="text-muted">{event.date}</small>
                                </div>
                                <Card.Title>{event.title}</Card.Title>
                                <Card.Text className="text-muted small">
                                    {event.description}
                                </Card.Text>
                                <div className="mb-3">
                                    <strong>Looking for:</strong>
                                    <div className="d-flex flex-wrap gap-1 mt-1">
                                        {/* Backend might store as comma-sep string or not return it if empty */}
                                        {event.requiredServices && Array.isArray(event.requiredServices) ? (
                                            event.requiredServices.map((s, i) => (
                                                <Badge key={i} bg="secondary" className="fw-normal">{s}</Badge>
                                            ))
                                        ) : (
                                            <small className="text-muted">Not specified</small>
                                        )}
                                    </div>
                                </div>

                                {appliedEvents.includes(event.id) ? (
                                    <Button variant="success" className="w-100" disabled>
                                        Request Sent ✓
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        className="w-100"
                                        onClick={() => initiateApply(event.id)}
                                        disabled={!isProfileComplete}
                                        title={!isProfileComplete ? "Complete profile to apply" : "Offer Service"}
                                    >
                                        {isProfileComplete ? "Offer Service" : "Setup Profile First"}
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            {events.length === 0 && <p className="text-center text-muted">No upcoming events found.</p>}

            {/* Quote Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Send Quote</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Your Quote Amount (₹)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter amount (e.g., 5000)"
                                value={quotePrice}
                                onChange={(e) => setQuotePrice(e.target.value)}
                                autoFocus
                            />
                            <Form.Text className="text-muted">
                                Enter the total amount you want to charge for this service.
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleApply}>
                        Send Application
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AvailableEvents;
