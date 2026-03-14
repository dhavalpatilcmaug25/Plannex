import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateEvent = () => {
    const navigate = useNavigate();

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);

    // Data Lists
    const [servicesList, setServicesList] = useState([]);
    const [locationsList, setLocationsList] = useState([]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Pre-fill location from logged-in user
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.location) {
                        setLocation(user.location);
                    }
                }

                const [servicesRes, locationsRes] = await Promise.all([
                    api.get('/misc/services'),
                    api.get('/misc/locations')
                ]);
                setServicesList(servicesRes.data);
                setLocationsList(locationsRes.data);
            } catch (err) {
                console.error("Failed to fetch metadata", err);
                setError("Failed to load options from server.");
            }
        };
        fetchMetadata();
    }, []);

    const handleServiceChange = (service) => {
        if (selectedServices.includes(service)) {
            setSelectedServices(selectedServices.filter(s => s !== service));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const validateForm = () => {
        // Regex Patterns
        const titleRegex = /^[a-zA-Z0-9\s&'-]+$/;

        if (!title.trim()) { setError("Title is required"); return false; }
        if (!titleRegex.test(title)) { setError("Title contains invalid characters"); return false; }

        if (!description.trim()) { setError("Description is required"); return false; }

        if (!date) { setError("Date is required"); return false; }
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) { setError("Event date cannot be in the past"); return false; }

        if (!location) { setError("Location is required"); return false; }
        if (!category) { setError("Category is required"); return false; }

        if (selectedServices.length === 0) { setError("Please select at least one service"); return false; }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            const newEvent = {
                title,
                description,
                date: `${date}T00:00:00`,
                location,
                category,
                requiredServices: selectedServices
            };

            await api.post('/event', newEvent);
            // Redirect to My Events (or Dashboard for now)
            navigate('/customer/dashboard');
        } catch (err) {
            console.error("Create event failed", err);
            setError("Failed to create event. Please try again.");
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5 mb-5 d-flex justify-content-center flex-column align-items-center animate-fade-in">
            <div className="w-100" style={{ maxWidth: '600px' }}>
                <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate('/customer/dashboard')}>
                    &larr; Back to Dashboard
                </Button>
            </div>
            <Card style={{ width: '600px' }} className="card-modern border-0">
                <Card.Header as="h4" className="bg-white border-bottom fw-bold text-center py-3">Create New Event</Card.Header>
                <Card.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Event Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. John & Jane Wedding"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                                className="form-input"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Category</Form.Label>
                            <Form.Select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={loading}
                                className="form-input"
                            >
                                <option value="">Select Category</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Corporate">Corporate</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Concert">Concert</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Describe your event..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                className="form-input"
                            />
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Event Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        disabled={loading}
                                        className="form-input"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">Location</Form.Label>
                                    <Form.Select value={location} onChange={(e) => setLocation(e.target.value)} disabled={true} className="form-input bg-light">
                                        <option value="">Select Location</option>
                                        <option value="Mumbai">Mumbai</option>
                                        <option value="Pune">Pune</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Bangalore">Bangalore</option>
                                        <option value="Hyderabad">Hyderabad</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">Required Services</Form.Label>
                            {servicesList.length === 0 ? <p className="text-muted small">Loading services...</p> : (
                                <div className="d-flex flex-wrap gap-2">
                                    {servicesList.map(service => (
                                        <Form.Check
                                            key={service}
                                            type="checkbox"
                                            label={service}
                                            id={`service-${service}`}
                                            checked={selectedServices.includes(service)}
                                            onChange={() => handleServiceChange(service)}
                                            disabled={loading}
                                        />
                                    ))}
                                </div>
                            )}
                        </Form.Group>

                        <div className="d-grid mt-4">
                            <Button variant="primary" size="lg" type="submit" disabled={loading} className="btn-primary">
                                {loading ? <Spinner animation="border" size="sm" /> : "Publish Event"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateEvent;
