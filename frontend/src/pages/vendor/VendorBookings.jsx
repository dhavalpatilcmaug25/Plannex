import React, { useState, useEffect } from 'react';
import { Table, Badge, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import useAuth from '../../hooks/useAuth';

const VendorBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/booking/vendor-bookings');
            setBookings(response.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await api.put(`/booking/${bookingId}/status`, newStatus);
            fetchBookings(); // Refresh list
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="animate-fade-in">
            <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
                &larr; Back
            </Button>
            <h2 className="fw-bold mb-4">My Bookings</h2>
            <Card className="card-modern border-0">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">Incoming Requests</h5>
                </Card.Header>
                {bookings.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        No bookings found.
                    </div>
                ) : (
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 border-0">Customer</th>
                                <th className="py-3 border-0">Service</th>
                                <th className="py-3 border-0">Amount</th>
                                <th className="py-3 border-0">Date</th>
                                <th className="py-3 border-0">Status</th>
                                <th className="py-3 border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{b.user?.username || 'Unknown User'}</div>
                                        <div className="small text-muted">{b.user?.email || 'No Email'}</div>
                                    </td>
                                    <td>{b.event?.title || 'Unknown Event'}</td>
                                    <td className="fw-bold text-primary">₹{b.amount || 0}</td>
                                    <td>{b.event?.date ? new Date(b.event.date).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <Badge
                                            bg={b.status === 'CONFIRMED' || b.status === 'ACCEPTED' || b.status === 'PAID' ? 'success' : b.status === 'ADVANCE_PAID' ? 'info' : b.status === 'WORK_COMPLETED' ? 'warning' : b.status === 'REJECTED' || b.status === 'CANCELLED' ? 'danger' : 'warning'}
                                            className="rounded-pill px-3"
                                        >
                                            {b.status === 'ADVANCE_PAID' ? 'ADVANCE PAID' : b.status === 'WORK_COMPLETED' ? 'WORK COMPLETED' : b.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            {b.status === 'ADVANCE_PAID' && (
                                                <Button size="sm" variant="success" className="rounded-pill px-3" onClick={() => handleStatusUpdate(b.id, 'WORK_COMPLETED')}>
                                                    Mark Work Completed
                                                </Button>
                                            )}
                                            {(b.status === 'ACCEPTED' || b.status === 'CONFIRMED' || b.status === 'PAID' || b.status === 'ADVANCE_PAID' || b.status === 'WORK_COMPLETED') && (
                                                <Button size="sm" variant="outline-primary" className="rounded-pill px-3" onClick={() => navigate('/vendor/chat', { state: { recipientId: b.user?.id, recipientName: b.user?.username } })}>
                                                    Chat
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>
        </div>
    );
};

export default VendorBookings;
