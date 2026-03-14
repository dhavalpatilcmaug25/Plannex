import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import eventService from '../../services/eventService';

const MyEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [refresh]);

    const fetchEvents = async () => {
        try {
            const data = await eventService.getMyEvents();
            console.log("Fetched My Events Data:", data);
            if (data && data.length > 0 && data[0].applications) {
                console.log("First event applications:", data[0].applications);
            }
            setEvents(data);
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (eventId, appId, status) => {
        try {
            await eventService.updateApplicationStatus(eventId, appId, status);
            toast.success(`Request ${status.toLowerCase()} successfully!`);
            setRefresh(!refresh);
        } catch (err) {
            console.error("Status update failed", err);
            toast.error(err.response?.data || "Failed to update status");
        }
    };

    const renderServiceSlot = (event, serviceName) => {
        // Find if this service slot is already filled (PAID or APPROVED)
        const filledApp = event.applications?.find(app => {
            if (!app.serviceCategory) return false;
            const appCategory = app.serviceCategory.trim().toLowerCase();
            const targetCategory = serviceName.trim().toLowerCase();
            return appCategory === targetCategory && ['APPROVED', 'PAID', 'CONFIRMED', 'ACCEPTED', 'ADVANCE_PAID', 'WORK_COMPLETED'].includes(app.status?.toUpperCase());
        });

        if (filledApp) {
            const status = filledApp.status?.toUpperCase();
            const isPaid = status === 'PAID' || status === 'CONFIRMED';
            const isAdvancePaid = status === 'ADVANCE_PAID';
            const isWorkCompleted = status === 'WORK_COMPLETED';

            return (
                <div className="p-3 border rounded-4 mb-3 bg-white shadow-sm transition-all border-success" style={{ borderLeftWidth: '5px' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Badge bg={isPaid ? "success" : isAdvancePaid ? "info" : isWorkCompleted ? "warning" : "primary"} className="rounded-pill px-3 py-1 mb-2">
                                {isPaid ? "Paid" : isAdvancePaid ? "Advance Paid" : isWorkCompleted ? "Work Completed" : "Accepted"}
                            </Badge>
                            {isAdvancePaid && <small className="d-block text-muted fst-italic mb-1">Waiting for Vendor to Complete Work</small>}
                            {isWorkCompleted && <small className="d-block text-success fw-bold mb-1">Work Completed! Please Pay Balance.</small>}

                            <h6 className="mb-1 fw-bold">{filledApp.vendorName}</h6>
                            <span className="text-muted small d-block mb-2">Finalized at ₹{filledApp.price}</span>
                            <Button size="sm" variant="link" className="p-0 text-decoration-none small fw-medium" onClick={() => navigate(`/vendor/${filledApp.vendorId}`)}>
                                View Profile <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.7rem' }}></i>
                            </Button>
                        </div>
                        <div className="text-end">
                            <div className="mb-2">
                                <Button size="sm" variant="light" className="rounded-pill px-3 border" onClick={() => navigate('/customer/chat', { state: { recipientId: filledApp.vendorId, recipientName: filledApp.vendorName } })}>
                                    <i className="bi bi-chat-dots me-1"></i> Chat
                                </Button>
                            </div>
                            <div className="d-flex flex-column gap-2">
                                {!isPaid && !isAdvancePaid && !isWorkCompleted && (
                                    <>
                                        <Button size="sm" variant="success" className="rounded-pill px-3 shadow-sm w-100" onClick={() => navigate(`/customer/payment/${event.id}`, { state: { vendorId: filledApp.vendorId, vendorName: filledApp.vendorName, amount: filledApp.price / 2, appId: filledApp.id, type: 'ADVANCE' } })}>
                                            Pay Advance (50%)
                                        </Button>
                                        <Button size="sm" variant="outline-success" className="rounded-pill px-3 w-100" onClick={() => navigate(`/customer/payment/${event.id}`, { state: { vendorId: filledApp.vendorId, vendorName: filledApp.vendorName, amount: filledApp.price, appId: filledApp.id, type: 'FULL' } })}>
                                            Pay Full Amount
                                        </Button>
                                    </>
                                )}
                                {(isWorkCompleted || isAdvancePaid) && !isPaid && (
                                    <Button size="sm" variant="success" className="rounded-pill px-3 shadow-sm w-100" onClick={() => navigate(`/customer/payment/${event.id}`, { state: { vendorId: filledApp.vendorId, vendorName: filledApp.vendorName, amount: filledApp.price / 2, appId: filledApp.id, type: 'FINAL' } })}>
                                        Pay Balance (Remaining 50%)
                                    </Button>
                                )}
                                {!isPaid && !isAdvancePaid && !isWorkCompleted && (
                                    <Button size="sm" variant="outline-danger" className="rounded-pill px-3 w-100" onClick={() => handleStatusUpdate(event.id, filledApp.id, 'REJECTED')}>
                                        Reject
                                    </Button>
                                )}
                                {isPaid && (
                                    <Button size="sm" variant="outline-primary" className="rounded-pill px-3 w-100" onClick={() => navigate(`/vendor/${filledApp.vendorId}`, { state: { activeTab: 'reviews' } })}>
                                        <i className="bi bi-star me-1"></i> Review
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Otherwise show pending applicants for this specific service
        const pendingApps = event.applications?.filter(app => {
            if (!app.serviceCategory) return false;
            const appCategory = app.serviceCategory.trim().toLowerCase();
            const targetCategory = serviceName.trim().toLowerCase();
            return appCategory === targetCategory && app.status?.toUpperCase() === 'PENDING';
        });

        return (
            <div className="p-3 border rounded-4 mb-3 bg-white shadow-sm border-light-subtle">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 fw-bold">{serviceName}</h6>
                    <Badge bg="warning" text="dark" className="rounded-pill px-3">Open</Badge>
                </div>
                {pendingApps && pendingApps.length > 0 ? (
                    <div className="mt-2">
                        {pendingApps.map((app, idx) => (
                            <div key={idx} className="p-3 border rounded-3 mb-2 bg-light-subtle d-flex justify-content-between align-items-center hover-shadow-sm transition-all">
                                <div>
                                    <div className="fw-bold mb-1">{app.vendorName}</div>
                                    <div className="text-primary fw-bold">₹{app.price}</div>
                                    <Button size="sm" variant="link" className="p-0 text-decoration-none small text-muted mt-1" onClick={() => navigate(`/vendor/${app.vendorId}`)}>
                                        See Work Samples &rarr;
                                    </Button>
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    <Button size="sm" variant="primary" className="rounded-pill px-3 fw-bold" onClick={() => handleStatusUpdate(event.id, app.id, 'APPROVED')}>
                                        Approve
                                    </Button>
                                    <Button size="sm" variant="outline-danger" className="rounded-pill px-3 fw-medium" onClick={() => handleStatusUpdate(event.id, app.id, 'REJECTED')}>
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 bg-light rounded-3">
                        <i className="bi bi-person-plus text-muted mb-2 d-block fs-4"></i>
                        <p className="text-muted small mb-0 font-italic">No applicants yet</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Container className="mt-4 mb-5 animate-fade-in">
            <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate('/customer/dashboard')}>
                &larr; Back to Dashboard
            </Button>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h1 className="fw-bold mb-0">My Events</h1>
                <Button variant="primary" size="lg" className="rounded-pill px-4 shadow-sm" onClick={() => navigate('/customer/events/new')}>
                    <i className="bi bi-plus-lg me-2"></i> Create New Event
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading your events...</p>
                </div>
            ) : events.length === 0 ? (
                <Card className="text-center p-5 border-0 shadow-sm rounded-4">
                    <div className="display-1 text-muted mb-4">🎉</div>
                    <h3>Ready to plan something amazing?</h3>
                    <p className="text-muted mb-4">Create your first event and start receiving offers from professionals.</p>
                    <Button variant="primary" size="lg" className="rounded-pill px-5 mx-auto" onClick={() => navigate('/customer/events/new')}>
                        Get Started
                    </Button>
                </Card>
            ) : (
                events.map(event => (
                    <Card key={event.id} className="mb-5 shadow-sm border-0 rounded-4 overflow-hidden card-modern">
                        <Card.Header className="bg-white py-4 px-4 border-bottom d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-primary small fw-bold text-uppercase ls-1 mb-1">
                                    <i className="bi bi-calendar-event me-2"></i>
                                    {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                                <h3 className="fw-bold mb-0">{event.title}</h3>
                            </div>
                            <div className="text-end">
                                <Badge bg={event.status === 'COMPLETED' ? 'success' : 'primary'} className="rounded-pill px-4 py-2 mb-2">
                                    {event.status}
                                </Badge>
                                <div className="small text-muted"><i className="bi bi-geo-alt-fill me-1"></i> {event.location}</div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row>
                                <Col lg={4} className="border-end">
                                    <div className="pe-lg-4">
                                        <h6 className="fw-bold mb-3 text-uppercase small text-muted ls-1">Description</h6>
                                        <p className="text-dark mb-4 lead" style={{ fontSize: '1rem' }}>{event.description}</p>

                                        <div className="p-3 bg-light rounded-4 mb-4">
                                            <h6 className="fw-bold mb-2 small">Need help?</h6>
                                            <p className="small text-muted mb-0">Our support team is here to assist you with vendor selection.</p>
                                        </div>
                                    </div>
                                </Col>
                                <Col lg={8}>
                                    <div className="ps-lg-2">
                                        <h6 className="fw-bold mb-4 text-uppercase small text-muted ls-1">Service Categories & Status</h6>
                                        {event.requiredServices && event.requiredServices.length > 0 ? (
                                            <Row className="g-3">
                                                {event.requiredServices.map(service => (
                                                    <Col md={6} key={service}>
                                                        {renderServiceSlot(event, service)}
                                                    </Col>
                                                ))}
                                            </Row>
                                        ) : (
                                            <Alert variant="light" className="border">No specific services selected for this event.</Alert>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))
            )}
        </Container>
    );
};

export default MyEvents;
