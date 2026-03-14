import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import vendorService from '../../services/vendorService';
import applicationService from '../../services/applicationService';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalEarnings: 0, activeJobs: 0 });
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await vendorService.getVendorStats();
                setStats(data);
                const appData = await applicationService.getVendorApplications();
                setRequests(appData);
            } catch (error) {
                console.error("Failed to fetch vendor stats", error);
                // Mock data in case of error for demo
                setStats({ totalEarnings: 12500, activeJobs: 3 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleStatus = async (id, status) => {
        try {
            await applicationService.updateStatus(id, status);
            setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
            alert(`Request ${status}`);
        } catch (e) {
            console.error(e);
            alert("Action failed");
        }
    };

    const sections = [
        { title: "Browse Events", desc: "Find new bookings", action: () => navigate('/vendor/events'), variant: "primary", icon: "🔍", bg: "bg-primary-subtle text-primary" },
        { title: "My Bookings", desc: "Track active jobs", action: () => navigate('/vendor/bookings'), variant: "outline-primary", icon: "📅", bg: "bg-success-subtle text-success" },
        { title: "Profile & Portfolio", desc: "Manage your presence", action: () => navigate('/vendor/services'), variant: "outline-secondary", icon: "🛠️", bg: "bg-info-subtle text-info" },
        { title: "Client Chat", desc: "Respond to inquiries", action: () => navigate('/vendor/chat'), variant: "outline-secondary", icon: "💬", bg: "bg-warning-subtle text-warning" },
    ];

    return (
        <div className="animate-fade-in">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1">Vendor Portal</h2>
                    <p className="text-muted">Manage your business and find new clients.</p>
                </div>
                <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 shadow-sm">Status: Online</Badge>
            </div>

            <Row className="g-4">
                {/* Stats Card */}
                <Col md={12}>
                    <Card className="card-modern border-0 mb-4 bg-primary text-white position-relative overflow-hidden">
                        <div className="position-absolute top-0 end-0 opacity-10" style={{ transform: 'translate(20%, -20%)' }}>
                            <i className="bi bi-wallet2" style={{ fontSize: '15rem' }}></i>
                        </div>
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center position-relative">
                            {loading ? (
                                <Spinner animation="border" variant="light" />
                            ) : (
                                <>
                                    <div>
                                        <h5 className="opacity-75 mb-1">Total Earnings</h5>
                                        <h1 className="fw-bold mb-0 display-4">₹{(stats?.totalEarnings || 0).toLocaleString()}</h1>
                                    </div>
                                    <div className="text-end">
                                        <h5 className="opacity-75 mb-1">Active Jobs</h5>
                                        <h3 className="fw-bold mb-0 display-4">{stats.activeJobs}</h3>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>


                    {/* Pending Requests */}
                    <Card className="card-modern border-0 mb-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Incoming Requests</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {requests.length === 0 ? (
                                <p className="text-center py-4 text-muted">No pending requests.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4">Client Event</th>
                                                <th>Date</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map(req => (
                                                <tr key={req.id}>
                                                    <td className="ps-4">
                                                        <div className="fw-bold">{req.event?.title}</div>
                                                        <small className="text-muted">{req.event?.type}</small>
                                                    </td>
                                                    <td>{req.event?.date}</td>
                                                    <td className="fw-bold">₹{req.price}</td>
                                                    <td>
                                                        <Badge bg={req.status === 'ACCEPTED' || req.status === 'PAID' ? 'success' : req.status === 'ADVANCE_PAID' ? 'info' : req.status === 'WORK_COMPLETED' ? 'warning' : req.status === 'REJECTED' ? 'danger' : 'warning'}>
                                                            {req.status === 'ADVANCE_PAID' ? 'ADVANCE PAID' : req.status === 'WORK_COMPLETED' ? 'WORK COMPLETED' : req.status}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {req.status === 'PENDING' && <span className="text-muted">Pending</span>}
                                                        {(req.status === 'ACCEPTED' || req.status === 'PAID') && <Button size="sm" variant="outline-primary" onClick={() => navigate('/vendor/chat')}>Chat</Button>}
                                                        {req.status === 'REJECTED' && <span className="text-danger">Declined</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {sections.map((sec, idx) => (
                    <Col md={3} sm={6} key={idx}>
                        <Card className="card-hover h-100 border-0 text-center">
                            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                                <div className={`rounded-circle d-flex align-items-center justify-content-center mb-3 ${sec.bg}`} style={{ width: 64, height: 64, fontSize: '1.75rem' }}>
                                    {sec.icon}
                                </div>
                                <Card.Title className="fw-bold">{sec.title}</Card.Title>
                                <Card.Text className="text-muted mb-4 small">{sec.desc}</Card.Text>
                                <Button variant={sec.variant} onClick={sec.action} className="w-100 rounded-pill btn-sm fw-bold py-2">
                                    Go
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div >
    );
};

export default VendorDashboard;
