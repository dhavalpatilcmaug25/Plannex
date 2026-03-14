import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, InputGroup, Spinner, Alert, Container, Offcanvas } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';

import api from '../services/api';

const Explore = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState('All');
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Advanced Filters State
    const [showFilters, setShowFilters] = useState(false);

    // State for filters (excluding location, which is derived)
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        sort: ''
    });

    // Derived Location (Single Source of Truth)
    const user = JSON.parse(localStorage.getItem('user'));
    const currentLocation = user?.location && user.location.trim() !== ''
        ? user.location
        : (searchParams.get('location') || localStorage.getItem('guest_location') || '');

    // Sync URL with derived location if missing (e.g. Guest persistence)
    useEffect(() => {
        if (!user?.location && !searchParams.get('location') && currentLocation) {
            const currentSearch = searchParams.get('search') || '';
            navigate(`/vendors?search=${currentSearch}&location=${currentLocation}`, { replace: true });
        }
    }, [currentLocation, searchParams, navigate]);

    useEffect(() => {
        console.log("Explore.jsx: Current Location derived as:", currentLocation);
        fetchVendors();
    }, [searchParams, category, filters, currentLocation]);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const search = searchParams.get('search');
            console.log("Explore.jsx: Fetching vendors:", {
                search,
                location: currentLocation,
                category
            });

            // Normalize Category
            let apiCategory = undefined;
            if (category && category !== 'All') {
                apiCategory = category.toUpperCase().replace('/', '_').replace(' ', '_'); // e.g. Music/DJ -> MUSIC_DJ
            }

            const response = await api.get('/vendor', {
                params: {
                    search: (search || searchTerm || '').trim() || undefined,
                    location: currentLocation,
                    category: apiCategory,
                    minPrice: filters.minPrice || undefined,
                    maxPrice: filters.maxPrice || undefined,
                    sort: filters.sort || undefined
                }
            });

            const mappedVendors = response.data.map(v => ({
                id: v.id,
                name: v.businessName || "Unknown",
                category: v.category || "General",
                rating: 4.5,
                price: v.price ? `₹${v.price}` : "Contact for Price",
                location: v.location || "Location N/A",
                image: v.imageUrl, // Pass the actual URL
                description: v.description
            }));
            setVendors(mappedVendors);
        } catch (err) {
            console.error("Error fetching vendors:", err);
            setError("Failed to load vendors.");
        } finally {
            setLoading(false);
        }
    };

    // No client-side filtering needed now as backend handles it, but we keep mappedVendors
    const filteredVendors = vendors;

    return (
        <Container className="py-5 animate-fade-in">
            <div className="text-center mb-5">
                <h1 className="fw-bold display-5 mb-3">Explore Top Professionals</h1>
                <p className="text-muted lead mb-5">Find the best vendors for your special day.</p>

                <div className="d-flex justify-content-center position-relative" style={{ zIndex: 2 }}>
                    <InputGroup style={{ maxWidth: '600px' }} className="shadow-lg rounded-pill overflow-hidden border-0 p-1 bg-white">
                        <InputGroup.Text className="bg-white border-0 ps-4 text-muted">
                            <i className="bi bi-search fs-5"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search for photographers, venues, etc..."
                            className="border-0 shadow-none form-control-lg fs-6"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/vendors?search=${searchTerm}&location=${currentLocation}`)}
                        />
                        <Button
                            variant="primary"
                            className="rounded-pill px-4 m-1 fw-bold"
                            onClick={() => navigate(`/vendors?search=${searchTerm}&location=${currentLocation}`)}
                        >
                            Search
                        </Button>
                    </InputGroup>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="d-flex gap-2 mb-5 justify-content-center flex-wrap">
                {['All', 'Photography', 'Catering', 'Decoration', 'Music/DJ', 'Venue', 'Makeup Artist'].map(cat => (
                    <Button
                        key={cat}
                        variant={category === cat ? 'dark' : 'white'}
                        className={`rounded-pill px-4 py-2 fw-medium border shadow-sm transition-all ${category === cat ? 'bg-primary border-primary text-white' : 'text-secondary hover-scale'}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-dark" onClick={() => setShowFilters(true)}>
                    <i className="bi bi-funnel-fill me-2"></i> Filters
                </Button>
                <div>
                    <span className="text-muted small">{vendors.length} results found</span>
                </div>
            </div>

            {/* Vendor Grid */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : error ? (
                <Alert variant="danger" className="text-center">{error}</Alert>
            ) : (
                <Row className="g-4">
                    {filteredVendors.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <div className="mb-3" style={{ fontSize: '3rem' }}>🕵️</div>
                            <h4>No vendors found</h4>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        filteredVendors.map(vendor => (
                            <Col md={4} sm={6} key={vendor.id}>
                                <Card className="card-hover h-100 border-0 rounded-4 overflow-hidden shadow-sm">
                                    <div style={{ height: '220px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }} className="d-flex align-items-center justify-content-center text-secondary position-relative">
                                        {vendor.image ? (
                                            <img
                                                src={vendor.image}
                                                alt={vendor.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ fontSize: '4rem' }} className="opacity-50">
                                                {vendor.category === 'Photography' ? '📷' :
                                                    vendor.category === 'Catering' ? '🍽️' :
                                                        vendor.category === 'Decoration' ? '🎈' : '🏢'}
                                            </div>
                                        )}
                                        <div className="position-absolute bottom-0 start-0 m-3">
                                            <span className="badge bg-white text-dark shadow-sm rounded-pill px-3 py-2">
                                                <small className="fw-bold">{vendor.price}</small>
                                            </span>
                                        </div>
                                    </div>
                                    <Card.Body className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="fw-bold mb-0 text-truncate" title={vendor.name}>{vendor.name}</h5>
                                            <div className="d-flex align-items-center gap-1 text-warning small fw-bold">
                                                <i className="bi bi-star-fill"></i> {vendor.rating}
                                            </div>
                                        </div>
                                        <p className="text-primary small mb-3 fw-medium text-uppercase ls-1">{vendor.category}</p>
                                        <p className="text-muted small mb-4 line-clamp-2">{vendor.description || "No description available for this vendor."}</p>

                                        <div className="d-flex gap-2 mt-auto">
                                            <Button variant="light" className="w-100 rounded-pill" onClick={() => navigate(`/vendor/${vendor.id}`)}>
                                                View Profile <i className="bi bi-arrow-right ms-2"></i>
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            )}




            {/* Filter Offcanvas */}
            <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filter Options</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Location (City)</Form.Label>
                            {JSON.parse(localStorage.getItem('user'))?.location ? (
                                <div>
                                    <Form.Control
                                        value={currentLocation}
                                        disabled
                                        className="bg-light"
                                        title="Location is locked to your registered city"
                                    />
                                    <Form.Text className="text-muted small">
                                        <i className="bi bi-lock-fill me-1"></i>
                                        Locked to your registered location
                                    </Form.Text>
                                </div>
                            ) : (
                                <Form.Select
                                    value={currentLocation}
                                    onChange={(e) => {
                                        const newLocation = e.target.value;
                                        localStorage.setItem('guest_location', newLocation);
                                        const currentSearch = searchParams.get('search') || '';
                                        navigate(`/vendors?search=${currentSearch}&location=${newLocation}`);
                                    }}
                                >
                                    <option value="">Select City (All)</option>
                                    {['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad'].map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </Form.Select>
                            )}
                        </Form.Group>

                        <Form.Label>Price Range</Form.Label>
                        <Row className="mb-3">
                            <Col>
                                <Form.Control
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                />
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Sort By</Form.Label>
                            <Form.Select
                                value={filters.sort}
                                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                            >
                                <option value="">Default</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="secondary" onClick={() => {
                                setFilters({ minPrice: '', maxPrice: '', sort: '' });
                                localStorage.removeItem('guest_location');
                                navigate('/vendors');
                            }}>
                                Clear Filters
                            </Button>
                            <Button variant="primary" onClick={() => setShowFilters(false)}>
                                Done
                            </Button>
                        </div>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>

        </Container >
    );
};

export default Explore;
