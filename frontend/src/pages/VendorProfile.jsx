import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Image, Nav, Modal, Form } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import vendorService from '../services/vendorService';
import eventService from '../services/eventService';
import applicationService from '../services/applicationService';
import ReviewsSection from '../components/ReviewsSection';
import useAuth from '../hooks/useAuth';

const VendorProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Request State
    const [showModal, setShowModal] = useState(false);
    const [myEvents, setMyEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [reqLoading, setReqLoading] = useState(false);

    useEffect(() => {
        if (!id || id === 'undefined') {
            setError("Invalid Vendor ID");
            setLoading(false);
            return;
        }

        const fetchVendor = async () => {
            try {
                const data = await vendorService.getVendor(id);
                setVendor(data);
            } catch (err) {
                setError("Vendor not found");
            } finally {
                setLoading(false);
            }

        };
        fetchVendor();
    }, [id]);

    const handleOpenRequest = async () => {
        // Fetch user's events to select from
        try {
            const events = await eventService.getMyEvents();
            setMyEvents(events);
            setShowModal(true);
        } catch (e) {
            alert("Please login as a Customer to send requests.");
        }
    };

    const handleSendRequest = async () => {
        if (!selectedEventId) {
            alert("Please select an event.");
            return;
        }
        setReqLoading(true);
        try {
            await applicationService.sendRequest({
                vendorId: id,
                eventId: selectedEventId,
                price: vendor.price || 0
            });
            alert("Request sent successfully!");
            setShowModal(false);
        } catch (e) {
            console.error(e);
            alert("Failed to send request. You may have already requested this vendor.");
        } finally {
            setReqLoading(false);
        }
    };

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'portfolio');

    // Also watch for state changes if the user is already on the page
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state?.activeTab]);

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error || !vendor) return <div className="p-5 text-center text-danger">Vendor not found</div>;

    // Helper to accept both string array (legacy/mock) or object array (backend)
    const portfolioImages = vendor.portfolio?.map(p => typeof p === 'string' ? p : p.imageUrl) || [];

    return (
        <Container className="py-4 animate-fade-in">
            {/* Back Button */}
            <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
                &larr; Back
            </Button>

            {/* Hero Section */}
            <Card className="card-modern border-0 mb-4 overflow-hidden">
                <div style={{ height: '200px', backgroundColor: '#667eea' }}></div> {/* Cover Image Placeholder */}
                <Card.Body className="position-relative pt-0 px-4 pb-4">
                    <div className="d-flex justify-content-between align-items-end" style={{ marginTop: '-50px' }}>
                        <div className="d-flex align-items-end">
                            <div className="bg-white p-1 rounded-circle shadow-sm me-3">
                                <Image src={vendor.imageUrl || "https://placehold.co/100"} roundedCircle width={100} height={100} style={{ objectFit: 'cover' }} />
                            </div>
                            <div className="mb-2">
                                <h2 className="fw-bold mb-0">{vendor.businessName || vendor.name}</h2>
                                <p className="text-muted mb-0">{vendor.category} • {vendor.location || 'Online'}</p>
                            </div>
                        </div>
                        <div className="mb-2 text-end">
                            <h3 className="fw-bold text-primary mb-0">{vendor.rating} ★</h3>
                            <small className="text-muted">High Rated</small>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h5 className="fw-bold">About Us</h5>
                        <p className="text-muted">{vendor.about || `Professional ${vendor.category} services.`}</p>
                        <Badge bg="success" className="fs-6 fw-normal px-3 py-2">
                            Starting at ₹{vendor.price}
                        </Badge>

                        {/* Strict Location Check */}
                        {user && user.location && vendor.location && user.location.toLowerCase() !== vendor.location.toLowerCase() ? (
                            <div className="d-inline-block ms-3">
                                <Button className="btn-secondary rounded-pill px-4" disabled title="Different Location">
                                    Location Mismatch <i className="bi bi-slash-circle"></i>
                                </Button>
                                <div className="text-danger small mt-1">
                                    <i className="bi bi-geo-alt-fill me-1"></i>
                                    Vendor is in {vendor.location}, you are in {user.location}.
                                </div>
                            </div>
                        ) : (
                            <Button className="ms-3 btn-primary rounded-pill px-4" onClick={handleOpenRequest}>
                                Send Request <i className="bi bi-arrow-right-short"></i>
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Tabs */}
            <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                    <Nav.Link eventKey="portfolio" className="fw-bold">Portfolio (Works)</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="reviews" className="fw-bold">Reviews & Ratings</Nav.Link>
                </Nav.Item>
            </Nav>

            {/* Tab Content */}
            {activeTab === 'portfolio' && (
                <Row className="g-3">
                    {portfolioImages.length > 0 ? portfolioImages.map((img, idx) => (
                        <Col md={4} key={idx}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Img variant="top" src={img} style={{ height: '200px', objectFit: 'cover' }} />
                            </Card>
                        </Col>
                    )) : (
                        <Col className="text-center py-5 text-muted">No portfolio images added yet.</Col>
                    )}
                </Row>
            )}

            {activeTab === 'reviews' && (
                <ReviewsSection vendor={vendor} />
            )}

            {/* Request Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Send Booking Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Select an event to add this vendor to:</p>
                    {myEvents.length === 0 ? (
                        <div className="text-center py-3">
                            <p className="text-muted">You have no upcoming events.</p>
                            <Button variant="outline-primary" onClick={() => navigate('/customer/events/new')}>Create Event</Button>
                        </div>
                    ) : (
                        <Form>
                            {myEvents.map(ev => (
                                <Form.Check
                                    key={ev.id}
                                    type="radio"
                                    id={`event-${ev.id}`}
                                    label={`${ev.title} (${ev.date})`}
                                    name="eventSelect"
                                    checked={selectedEventId == ev.id}
                                    onChange={() => setSelectedEventId(ev.id)}
                                    className="mb-2"
                                />
                            ))}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSendRequest} disabled={reqLoading || myEvents.length === 0}>
                        {reqLoading ? 'Sending...' : 'Send Request'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default VendorProfile;
