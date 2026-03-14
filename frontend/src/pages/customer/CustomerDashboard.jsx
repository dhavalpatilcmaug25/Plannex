import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import applicationService from '../../services/applicationService';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    React.useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await applicationService.getUserApplications();
                setRequests(data);
            } catch (e) {
                console.error("Failed to fetch requests", e);
            }
        };
        fetchRequests();
    }, []);

    const sections = [
        { title: "Create Event", desc: "Plan a new event", action: () => navigate('/customer/events/new'), variant: "primary", icon: <i className="bi bi-calendar-plus"></i>, bg: "bg-primary-subtle text-primary" },
        { title: "My Events", desc: "View and manage your events", action: () => navigate('/customer/events'), variant: "outline-primary", icon: <i className="bi bi-calendar-event"></i>, bg: "bg-info-subtle text-info" },
        { title: "My Bookings", desc: "Track vendor status", action: () => navigate('/customer/bookings'), variant: "outline-primary", icon: <i className="bi bi-journal-check"></i>, bg: "bg-success-subtle text-success" },
        { title: "Payments", desc: "View payment history", action: () => navigate('/customer/payments'), variant: "outline-secondary", icon: <i className="bi bi-credit-card"></i>, bg: "bg-warning-subtle text-warning" },
        { title: "Chat", desc: "Messages from vendors", action: () => navigate('/customer/chat'), variant: "outline-secondary", icon: <i className="bi bi-chat-dots"></i>, bg: "bg-danger-subtle text-danger" },
        { title: "Reviews", desc: "Rate your vendors", action: () => navigate('/customer/reviews'), variant: "outline-secondary", icon: <i className="bi bi-star"></i>, bg: "bg-secondary-subtle text-dark" },
    ];

    return (
        <div className="animate-fade-in">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1">Customer Dashboard</h2>
                    <p className="text-muted">Manage your events and bookings in one place.</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={() => navigate('/')} className="rounded-pill px-4 shadow-sm">
                        <i className="bi bi-house-door me-2"></i>Home
                    </Button>
                    <Button onClick={() => navigate('/customer/events/new')} className="btn-primary rounded-pill px-4 shadow-sm">
                        <i className="bi bi-plus-lg me-2"></i>New Event
                    </Button>
                </div>
            </div>


            {/* My Requests Section */}
            <Card className="card-modern border-0 mb-5">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0">My Requests</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {requests.length === 0 ? (
                        <p className="text-center py-4 text-muted">No pending requests sent.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Vendor</th>
                                        <th>Event</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Sort by ID descending (recent first) and paginate */
                                        [...requests]
                                            .sort((a, b) => b.id - a.id)
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((req, idx) => (
                                                <tr key={req.id || idx}>
                                                    <td className="ps-4">{req.vendorName || req.vendorEmail}</td>
                                                    <td>{req.event?.title}</td>
                                                    <td className="fw-bold">₹{req.price}</td>
                                                    <td>
                                                        <Badge bg={req.status === 'ACCEPTED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}>
                                                            {req.status}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {req.status === 'ACCEPTED' && (
                                                            <Button size="sm" variant="success" onClick={() => navigate(`/customer/payment/${req.event?.id}`)}>Pay Now</Button>
                                                        )}
                                                        {req.status === 'REJECTED' && <span className="text-danger small">Declined</span>}
                                                        {req.status === 'PENDING' && <span className="text-muted small">Pending...</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {requests.length > 0 && (
                        <div className="d-flex justify-content-end align-items-center p-3 border-top">
                            <Button
                                variant="light"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="me-2 rounded-circle"
                                style={{ width: 32, height: 32, padding: 0 }}
                            >
                                <i className="bi bi-chevron-left"></i>
                            </Button>
                            <span className="text-muted small mx-2">
                                {currentPage} / {Math.ceil(requests.length / itemsPerPage)}
                            </span>
                            <Button
                                variant="light"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(requests.length / itemsPerPage)))}
                                disabled={currentPage >= Math.ceil(requests.length / itemsPerPage)}
                                className="ms-2 rounded-circle"
                                style={{ width: 32, height: 32, padding: 0 }}
                            >
                                <i className="bi bi-chevron-right"></i>
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Row className="g-4">
                {sections.map((sec, idx) => (
                    <Col md={4} sm={6} key={idx}>
                        <Card className="card-hover h-100 border-0 text-center">
                            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                                <div className={`rounded-circle d-flex align-items-center justify-content-center mb-3 ${sec.bg}`} style={{ width: 64, height: 64, fontSize: '1.75rem' }}>
                                    {sec.icon}
                                </div>
                                <Card.Title className="fw-bold">{sec.title}</Card.Title>
                                <Card.Text className="text-muted mb-4 small">{sec.desc}</Card.Text>
                                <Button variant={sec.variant} onClick={sec.action} className="w-100 rounded-pill btn-sm fw-bold py-2">
                                    Open
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div >
    );
};

export default CustomerDashboard;
