import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CustomerPayments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            // Assuming there's an endpoint to get payments, or we filter bookings with PAID status
            // For now, let's try to get bookings that are PAID
            const response = await api.get('/booking/my-bookings');
            const paidBookings = response.data.filter(b =>
                b.status === 'PAID' || b.status === 'Paid' || b.paymentStatus === 'PAID'
            );
            setPayments(paidBookings);
        } catch (err) {
            console.error("Error fetching payments:", err);
            setError("Failed to load payment history.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
                &larr; Back
            </Button>
            <h2 className="fw-bold mb-4">Payment History</h2>

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
                                <th className="py-3 border-0">Vendor</th>
                                <th className="py-3 border-0">Service</th>
                                <th className="py-3 border-0">Status</th>
                                <th className="py-3 border-0 text-end pe-4">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-muted">No payment history available</td></tr>
                            ) : (
                                payments.map((p, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-4 font-monospace small">
                                            {p.event?.date ? new Date(p.event.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td>{p.event?.vendor?.username || p.event?.vendor?.businessName || 'Unknown Vendor'}</td>
                                        <td>{p.event?.title || 'Event Service'}</td>
                                        <td>
                                            <span className={`badge ${p.status === 'PAID' ? 'bg-success' : 'bg-warning'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4 fw-bold text-success">₹{p.amount || 0}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card>
            )}
        </div>
    );
};

export default CustomerPayments;
