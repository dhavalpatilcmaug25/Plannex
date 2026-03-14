import React from 'react';
import { Row, Col, Button, Card, Container, InputGroup, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const [searchService, setSearchService] = React.useState('');
    const [searchLocation, setSearchLocation] = React.useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchService) params.append('search', searchService);
        if (searchLocation) params.append('location', searchLocation);
        navigate(`/vendors?${params.toString()}`);
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="position-relative pt-5 pb-5 overflow-hidden">
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-body" style={{ zIndex: -1 }}>
                    {/* Abstract Background Shapes */}
                    <div className="position-absolute top-0 end-0 rounded-circle opacity-10 bg-primary" style={{ width: '600px', height: '600px', transform: 'translate(30%, -30%)' }}></div>
                    <div className="position-absolute bottom-0 start-0 rounded-circle opacity-10 bg-secondary" style={{ width: '400px', height: '400px', transform: 'translate(-30%, 30%)' }}></div>
                </div>

                <Container className="pt-5 pb-5">
                    <Row className="align-items-center g-5">
                        <Col lg={6} className="text-center text-lg-start animate-fade-in">
                            <span className="badge-custom badge-primary mb-3 d-inline-block">The #1 Event Platform</span>
                            <h1 className="display-3 mb-4 fw-bold" style={{ lineHeight: 1.1 }}>
                                Create Moments <br />
                                <span className="text-gradient">That Matter.</span>
                            </h1>
                            <p className="lead text-muted mb-5" style={{ maxWidth: '500px' }}>
                                From intimate gatherings to grand galas, find the perfect vendors and manage your entire event lifecycle in one place.
                            </p>

                            {/* Search Box - Hero */}
                            <div className="card-glass p-2 rounded-4 shadow-lg mb-4 d-none d-md-block">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 px-3 border-end">
                                        <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Looking For</div>
                                        <input
                                            type="text"
                                            className="border-0 w-100 bg-transparent p-0 fw-bold text-dark"
                                            style={{ outline: 'none' }}
                                            placeholder="Photographer, Venue..."
                                            value={searchService}
                                            onChange={(e) => setSearchService(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <div className="flex-grow-1 px-3">
                                        <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Location</div>
                                        <input
                                            type="text"
                                            className="border-0 w-100 bg-transparent p-0 fw-bold text-dark"
                                            style={{ outline: 'none' }}
                                            placeholder="Mumbai, Pune..."
                                            value={searchLocation}
                                            onChange={(e) => setSearchLocation(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <Button className="btn-primary rounded-3 px-4 py-2" onClick={handleSearch}>
                                        <i className="bi bi-search"></i>
                                    </Button>
                                </div>
                            </div>

                            {/* Mobile CTA */}
                            <div className="d-md-none d-flex gap-3 justify-content-center">
                                <Link to="/vendors">
                                    <Button className="btn-primary btn-lg rounded-pill w-100">Explore</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="light" className="btn-lg rounded-pill shadow-sm border w-100">Join Free</Button>
                                </Link>
                            </div>

                            <div className="mt-4 d-flex align-items-center gap-3 justify-content-center justify-content-lg-start text-muted small">
                                <div className="d-flex">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="rounded-circle border border-2 border-white bg-secondary d-flex align-items-center justify-content-center text-white"
                                            style={{ width: 32, height: 32, marginLeft: i > 1 ? -10 : 0, fontSize: 10 }}>
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div>Trusted by 2,000+ Event Planners</div>
                            </div>
                        </Col>
                        <Col lg={6} className="position-relative">
                            <div className="position-relative z-1">
                                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Event Celebration"
                                    className="img-fluid rounded-4 shadow-xl animate-fade-in"
                                    style={{ transform: 'rotate(2deg)' }}
                                />
                            </div>
                            {/* Decorative floaters */}
                            <div className="card-glass position-absolute top-0 start-0 p-3 rounded-4 shadow-lg animate-fade-in"
                                style={{ marginTop: '10%', marginLeft: '-5%', animationDelay: '0.2s', maxWidth: '200px' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-success text-white rounded-circle p-2 d-flex"><i className="bi bi-check-lg"></i></div>
                                    <div className="lh-1">
                                        <div className="fw-bold fs-6">Venue Booked</div>
                                        <small className="text-muted">Grand Hall</small>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Categories / Services */}
            <section className="py-5">
                <Container>
                    <div className="text-center mb-5">
                        <small className="text-uppercase text-primary fw-bold tracking-wider">Services</small>
                        <h2 className="mb-4">Everything you need</h2>
                    </div>

                    <Row className="g-4">
                        {[
                            { title: 'Venues', icon: 'bi-building', color: 'text-primary', bg: 'bg-primary-subtle' },
                            { title: 'Catering', icon: 'bi-egg-fried', color: 'text-warning', bg: 'bg-warning-subtle' },
                            { title: 'Photography', icon: 'bi-camera', color: 'text-success', bg: 'bg-success-subtle' },
                            { title: 'Music & DJ', icon: 'bi-music-note-beamed', color: 'text-danger', bg: 'bg-danger-subtle' },
                            { title: 'Decor', icon: 'bi-flower1', color: 'text-info', bg: 'bg-info-subtle' },
                            { title: 'Makeup', icon: 'bi-palette', color: 'text-secondary', bg: 'bg-secondary-subtle' },
                        ].map((item, idx) => (
                            <Col lg={2} md={4} sm={6} key={idx}>
                                <Link to="/vendors" className="text-decoration-none">
                                    <Card className="card-hover h-100 text-center border-0 bg-transparent">
                                        <Card.Body>
                                            <div className={`rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center ${item.bg} ${item.color}`}
                                                style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
                                                <i className={`bi ${item.icon}`}></i>
                                            </div>
                                            <h6 className="fw-bold text-dark">{item.title}</h6>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Vendor CTA */}
            <section className="py-5 bg-dark text-white position-relative overflow-hidden mb-5 rounded-5 container-custom my-5">
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}>
                </div>
                <Container className="position-relative py-5">
                    <Row className="align-items-center justify-content-between">
                        <Col lg={6}>
                            <h2 className="display-5 fw-bold mb-3">Are you an Event Professional?</h2>
                            <p className="lead opacity-75 mb-4">
                                Join our network of top-tier vendors. Showcase your work, manage bookings, and grow your business.
                            </p>
                            <Link to="/register">
                                <Button size="lg" className="btn-primary border-0" style={{ background: 'white', color: 'black' }}>
                                    Join as Vendor
                                </Button>
                            </Link>
                        </Col>
                        <Col lg={5} className="d-none d-lg-block">
                            {/* Stats or Graphic could go here */}
                            <div className="d-flex gap-4 border-start border-light ps-4">
                                <div>
                                    <div className="display-4 fw-bold">500+</div>
                                    <div className="opacity-75">Active Vendors</div>
                                </div>
                                <div>
                                    <div className="display-4 fw-bold">10k+</div>
                                    <div className="opacity-75">Events Managed</div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Home;
