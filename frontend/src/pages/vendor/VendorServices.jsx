import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import vendorService from '../../services/vendorService';
import api from '../../services/api';



const VendorServices = () => {


    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        businessName: '',
        category: 'Photography',
        price: '',
        imageUrl: '',
        location: ''
    });
    const [existingId, setExistingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [servicesList, setServicesList] = useState([]);
    const [locationsList, setLocationsList] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileData, servicesRes, locationsRes] = await Promise.all([
                    vendorService.getMyProfile(),
                    api.get('/misc/services'),
                    api.get('/misc/locations')
                ]);

                setServicesList(servicesRes.data);
                setLocationsList(locationsRes.data);

                if (profileData) {
                    setProfile({
                        businessName: profileData.businessName || '',
                        category: profileData.category || servicesRes.data[0] || '',
                        price: profileData.price || '',
                        imageUrl: profileData.imageUrl || '',
                        location: profileData.location || '',
                        portfolio: profileData.portfolio || []
                    });
                    setExistingId(profileData.id);
                }
            } catch (error) {
                console.log("No profile found or failed to load metadata.");
                // Still try to load services if profile failed
                try {
                    const [srvRes, locRes] = await Promise.all([
                        api.get('/misc/services'),
                        api.get('/misc/locations')
                    ]);
                    setServicesList(srvRes.data);
                    setLocationsList(locRes.data);
                } catch (e) { console.error(e); }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Validation
        const nameRegex = /^[a-zA-Z0-9\s&'-]+$/;
        if (!profile.businessName.trim() || !nameRegex.test(profile.businessName)) {
            setMessage('Error: Invalid Business Name.');
            return;
        }
        if (!profile.price || profile.price <= 0) {
            setMessage('Error: Price must be greater than 0.');
            return;
        }

        try {
            if (existingId) {
                await vendorService.updateVendorProfile(existingId, profile);
                setMessage('Profile updated successfully!');
            } else {
                const newProfile = await vendorService.createVendorProfile(profile);
                setExistingId(newProfile.id);
                setMessage('Profile created successfully!');
            }
        } catch (error) {
            console.error(error);
            setMessage('Error saving profile.');
        }
    };

    if (loading) return <div className="p-5 text-center">Loading...</div>;

    return (
        <div className="animate-fade-in">
            <Button variant="link" className="text-muted ps-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
                &larr; Back
            </Button>
            <h2 className="fw-bold mb-4">Manage Vendor Profile</h2>

            {message && <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} `}>{message}</div>}

            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="card-modern border-0 p-4">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Business Name</Form.Label>
                                <Form.Control
                                    value={profile.businessName}
                                    onChange={e => setProfile({ ...profile, businessName: e.target.value })}
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Category</Form.Label>
                                        <Form.Select
                                            value={profile.category}
                                            onChange={e => setProfile({ ...profile, category: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            {servicesList.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Base Price (₹)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={profile.price}
                                            onChange={e => setProfile({ ...profile, price: e.target.value })}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Location (City)</Form.Label>
                                        <Form.Select
                                            value={profile.location}
                                            onChange={e => setProfile({ ...profile, location: e.target.value })}
                                        >
                                            <option value="">Select City</option>
                                            {locationsList.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label>Image URL (Optional)</Form.Label>
                                <Form.Control
                                    placeholder="https://example.com/image.jpg"
                                    value={profile.imageUrl}
                                    onChange={e => setProfile({ ...profile, imageUrl: e.target.value })}
                                />
                            </Form.Group>

                            <Button type="submit" className="btn-primary w-100 btn-lg">
                                {existingId ? 'Update Profile' : 'Create Profile'}
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>

            {/* Portfolio Section */}
            {existingId && (
                <Row className="justify-content-center mt-5">
                    <Col md={12}>
                        <h3 className="fw-bold mb-4">Portfolio Management</h3>
                        <PortfolioManager profileId={existingId} initialImages={profile.portfolio || []} />
                    </Col>
                </Row>
            )}
        </div>
    );
};

const PortfolioManager = ({ profileId, initialImages }) => {
    // Note: initialImages might need to be fetched freshly or passed up. 
    // For now, let's fetch them or assume parent re-renders. 
    // Actually, let's fetch fresh portfolio data inside this component or in paretn.
    // Parent `loadProfile` needs to fetch portfolio too. API `getMyProfile` likely includes it now due to Controller change.

    // Let's implement a local state here
    const [images, setImages] = useState(initialImages); // initialImages from parent might need updating
    const [newImageUrl, setNewImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    // Re-sync with parent if needed, but for now let's trust internal state
    useEffect(() => {
        if (initialImages) setImages(initialImages);
    }, [initialImages]);

    const handleAddImage = async () => {
        if (!newImageUrl) return;
        setLoading(true);
        try {
            const addedImage = await vendorService.addPortfolioImage(newImageUrl);
            setImages([...images, addedImage]);
            setNewImageUrl('');
        } catch (error) {
            alert("Failed to add image");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (imgId) => {
        if (!window.confirm("Delete this image?")) return;
        try {
            await vendorService.removePortfolioImage(imgId);
            setImages(images.filter(img => img.id !== imgId));
        } catch (error) {
            alert("Failed to delete image");
        }
    };

    return (
        <Card className="card-modern border-0 p-4">
            <div className="mb-4">
                <InputGroup>
                    <Form.Control
                        placeholder="Paste Image URL here (e.g. from Unsplash/Imgur)"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <Button variant="outline-primary" onClick={handleAddImage} disabled={loading}>
                        {loading ? 'Adding...' : 'Add to Portfolio'}
                    </Button>
                </InputGroup>
            </div>

            <Row className="g-3">
                {images.map(img => (
                    <Col md={3} sm={6} key={img.id}>
                        <div className="position-relative group">
                            <img src={img.imageUrl} alt="Portfolio" className="w-100 rounded shadow-sm" style={{ height: '200px', objectFit: 'cover' }} />
                            <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-2 opacity-75"
                                onClick={() => handleDeleteImage(img.id)}
                            >
                                ×
                            </Button>
                        </div>
                    </Col>
                ))}
                {images.length === 0 && <p className="text-muted text-center col-12">No images yet. Add some to showcase your work!</p>}
            </Row>
        </Card>
    );
};

export default VendorServices;
