import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import adminService from '../../services/adminService';
import eventService from '../../services/eventService';
import reviewService from '../../services/reviewService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        totalEvents: 0,
        totalBookings: 0,
        totalRevenue: 0
    });
    const [users, setUsers] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // We need to add getAllBookings to adminService first
                // Assuming adminService.getAllBookings() will be implemented
                const [systemStats, usersData, events, bookingsData, reviewsData] = await Promise.all([
                    adminService.getSystemStats(),
                    adminService.getAllUsers(),
                    eventService.getAllEvents(),
                    adminService.getAllBookings(),
                    reviewService.getAllReviews()
                ]);

                setStats(systemStats);
                setUsers(usersData);
                setAllEvents(events);
                setBookings(bookingsData);
                setReviews(reviewsData);
            } catch (e) {
                console.error("Failed to fetch admin data", e);
                setError("Failed to load dashboard data. Ensure you are logged in as Admin.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApproveVendor = async (id) => {
        try {
            await adminService.approveVendor(id);
            setUsers(users.map(u => u.id === id ? { ...u, approved: true } : u));
            alert("Vendor Approved");
        } catch (e) {
            console.error(e);
            alert("Action failed");
        }
    };

    const handleSuspendUser = async (id, currentStatus) => {
        try {
            if (currentStatus) {
                await adminService.reactivateUser(id);
                alert("User Reactivated");
            } else {
                await adminService.suspendUser(id);
                alert("User Suspended");
            }
            // Update local state
            setUsers(users.map(u => u.id === id ? { ...u, suspended: !currentStatus } : u));
        } catch (e) {
            console.error(e);
            alert("Action failed");
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    const pendingVendors = users.filter(u => u.roles.some(r => r.name === 'ROLE_VENDOR') && !u.approved);

    return (
        <div className="animate-fade-in container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Admin Dashboard</h2>
                    <p className="text-muted">Overview and management.</p>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Analytics */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h6 className="text-muted">Total Users</h6>
                            <h3>{stats.totalUsers}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h6 className="text-muted">Total Vendors</h6>
                            <h3>{stats.totalVendors}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h6 className="text-muted">Total Events</h6>
                            <h3>{allEvents.length}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100 bg-primary text-white">
                        <Card.Body>
                            <h6 className="text-white-50">Total Revenue</h6>
                            <h3>₹{stats.totalRevenue?.toLocaleString() || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Users List */}
                <Col lg={8}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">All Users</h5>
                        </Card.Header>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light sticky-top">
                                    <tr>
                                        <th className="ps-4">Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="ps-4 fw-bold">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.roles.map(r => r.name).join(', ')}</td>
                                            <td>
                                                {user.suspended ? <Badge bg="danger">Suspended</Badge> : <Badge bg="success">Active</Badge>}
                                                {user.roles.some(r => r.name === 'ROLE_VENDOR') && (
                                                    user.approved ? <Badge bg="primary" className="ms-1">Approved</Badge> : <Badge bg="warning" className="ms-1">Pending</Badge>
                                                )}
                                            </td>
                                            <td>
                                                <Button size="sm" variant={user.suspended ? "outline-success" : "outline-danger"} onClick={() => handleSuspendUser(user.id, user.suspended)}>
                                                    {user.suspended ? "Reactivate" : "Suspend"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card>

                    {/* Bookings List (New) */}
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Recent Bookings</h5>
                        </Card.Header>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light sticky-top">
                                    <tr>
                                        <th className="ps-4">ID</th>
                                        <th>Event</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center text-muted">No bookings found.</td></tr>
                                    ) : (
                                        bookings.map(b => (
                                            <tr key={b.id}>
                                                <td className="ps-4 fw-bold">#{b.id}</td>
                                                <td>{b.event?.title || 'Unknown Event'}</td>
                                                <td className="fw-bold text-success">₹{b.amount}</td>
                                                <td>
                                                    <Badge bg={b.status === 'PAID' ? 'success' : 'warning'}>{b.status}</Badge>
                                                </td>
                                                <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>

                    {/* Reviews List */}
                    <Card className="shadow-sm border-0 mt-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Recent Reviews</h5>
                        </Card.Header>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light sticky-top">
                                    <tr>
                                        <th className="ps-4">ID</th>
                                        <th>Vendor</th>
                                        <th>Customer</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center text-muted">No reviews found.</td></tr>
                                    ) : (
                                        reviews.map(r => (
                                            <tr key={r.id}>
                                                <td className="ps-4 fw-bold">#{r.id}</td>
                                                <td>{r.vendor?.username || r.vendor?.email || 'Vendor #' + r.vendorId}</td>
                                                <td>{r.user?.username || r.user?.email || 'User #' + r.userId}</td>
                                                <td className="text-warning">{'★'.repeat(r.rating)}</td>
                                                <td><small className="text-muted d-inline-block text-truncate" style={{ maxWidth: '200px' }}>{r.content || r.comment}</small></td>
                                                <td>{new Date(r.date || Date.now()).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </Col>

                {/* Pending Vendors */}
                <Col lg={4}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Pending Vendor Approvals</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {pendingVendors.length === 0 ? (
                                <p className="text-center py-3 text-muted">No pending approvals</p>
                            ) : (
                                pendingVendors.map(v => (
                                    <div key={v.id} className="p-3 border-bottom d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold">{v.username}</div>
                                            <small className="text-muted">{v.email}</small>
                                        </div>
                                        <Button size="sm" variant="success" onClick={() => handleApproveVendor(v.id)}>Approve</Button>
                                    </div>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
