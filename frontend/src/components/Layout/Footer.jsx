import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer-section" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)', padding: '4rem 0 2rem' }}>
            <Container>
                <Row className="gy-4">
                    <Col lg={4} md={6}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-calendar2-heart-fill text-primary" style={{ fontSize: '1.8rem' }}></i>
                            <span className="fw-bold fs-4 text-dark">Plannex</span>
                        </div>
                        <p className="text-muted mb-4">
                            The ultimate platform for planning, booking, and managing events seamlessly. From weddings to corporate meets, we've got you covered.
                        </p>
                        <div className="d-flex gap-3">
                            {/* Social Placeholders */}
                            <a href="#" className="btn-ghost p-2"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="btn-ghost p-2"><i className="bi bi-twitter"></i></a>
                            <a href="#" className="btn-ghost p-2"><i className="bi bi-instagram"></i></a>
                            <a href="#" className="btn-ghost p-2"><i className="bi bi-linkedin"></i></a>
                        </div>
                    </Col>
                    <Col lg={2} md={6}>
                        <h6 className="fw-bold mb-3">Company</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/about" className="text-muted text-decoration-none hover-primary">About Us</Link></li>
                            <li className="mb-2"><Link to="/careers" className="text-muted text-decoration-none hover-primary">Careers</Link></li>
                            <li className="mb-2"><Link to="/blog" className="text-muted text-decoration-none hover-primary">Blog</Link></li>
                            <li className="mb-2"><Link to="/contact" className="text-muted text-decoration-none hover-primary">Contact</Link></li>
                        </ul>
                    </Col>
                    <Col lg={2} md={6}>
                        <h6 className="fw-bold mb-3">Support</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/help" className="text-muted text-decoration-none hover-primary">Help Center</Link></li>
                            <li className="mb-2"><Link to="/terms" className="text-muted text-decoration-none hover-primary">Terms of Service</Link></li>
                            <li className="mb-2"><Link to="/privacy" className="text-muted text-decoration-none hover-primary">Privacy Policy</Link></li>
                            <li className="mb-2"><Link to="/trust" className="text-muted text-decoration-none hover-primary">Trust & Safety</Link></li>
                        </ul>
                    </Col>
                    <Col lg={4} md={6}>
                        <h6 className="fw-bold mb-3">Stay Updated</h6>
                        <p className="text-muted mb-3">Subscribe to our newsletter for the latest event trends and updates.</p>
                        <form className="d-flex gap-2">
                            <input type="email" className="form-input" placeholder="Enter your email" />
                            <button type="submit" className="btn-primary">Subscribe</button>
                        </form>
                    </Col>
                </Row>
                <div className="text-center mt-5 pt-4 border-top">
                    <p className="text-muted small mb-0">&copy; {new Date().getFullYear()} Plannex. All rights reserved.</p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
