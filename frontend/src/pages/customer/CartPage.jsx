import React from 'react';
import { Container, Card, Button, Row, Col, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
    const { cartItems, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();
    const total = getCartTotal();

    return (
        <div className="animate-fade-in">
            <Container className="py-5">
                <h2 className="mb-4">Your Cart</h2>
                {cartItems.length === 0 ? (
                    <div className="text-center py-5">
                        <h3 className="text-muted">Your cart is empty</h3>
                        <Button variant="primary" className="mt-3" onClick={() => navigate('/vendors')}>
                            Explore Services
                        </Button>
                    </div>
                ) : (
                    <Row>
                        <Col md={8}>
                            <Card className="shadow-sm border-0 mb-4">
                                <ListGroup variant="flush">
                                    {cartItems.map((item) => (
                                        <ListGroup.Item key={item.id} className="p-4">
                                            <Row className="align-items-center">
                                                <Col xs={2} className="text-center" style={{ fontSize: '2rem' }}>
                                                    {item.image}
                                                </Col>
                                                <Col xs={6}>
                                                    <h5 className="mb-1">{item.name}</h5>
                                                    <p className="text-muted mb-0 small">{item.category}</p>
                                                </Col>
                                                <Col xs={2} className="text-end fw-bold">
                                                    {item.price}
                                                </Col>
                                                <Col xs={2} className="text-end">
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="shadow-sm border-0 p-4">
                                <h4 className="mb-3">Order Summary</h4>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Subtotal</span>
                                    <span className="fw-bold">₹{total.toLocaleString()}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="h5">Total</span>
                                    <span className="h5 text-primary">₹{total.toLocaleString()}</span>
                                </div>
                                <Button
                                    variant="success"
                                    size="lg"
                                    className="w-100"
                                    onClick={() => navigate('/checkout')}
                                >
                                    Proceed to Checkout
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default CartPage;
