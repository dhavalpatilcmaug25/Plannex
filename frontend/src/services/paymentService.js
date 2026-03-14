import api from './api';

class PaymentService {
    async createOrder(amount, userId, eventId = null, applicationId = null) {
        try {
            const response = await api.post('/payment/create-order', {
                amount,
                userId,
                eventId,
                applicationId
            });
            return response.data;
        } catch (error) {
            console.error('Error creating payment order:', error);
            throw error;
        }
    }

    async getRazorpayKey() {
        try {
            const response = await api.get('/payment/key');
            return response.data.key;
        } catch (error) {
            console.error('Error fetching Razorpay key:', error);
            throw error;
        }
    }

    async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        try {
            const response = await api.post('/payment/verify', {
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: razorpaySignature
            });
            return response.data;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    loadRazorpayScript() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }

    async initiatePayment(amount, userId, eventId, applicationId, onSuccess, onFailure) {
        try {
            // Load Razorpay script
            const scriptLoaded = await this.loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay SDK');
            }

            // Create order
            const order = await this.createOrder(amount, userId, eventId, applicationId);
            const key = await this.getRazorpayKey();

            // Get user details
            const user = JSON.parse(localStorage.getItem('user'));

            const options = {
                key: key,
                amount: order.amount * 100, // Amount in paise
                currency: order.currency,
                name: 'Plannex Events',
                description: 'Event Booking Payment',
                order_id: order.orderId,
                handler: async (response) => {
                    try {
                        const verificationResult = await this.verifyPayment(
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature
                        );

                        if (verificationResult.success) {
                            onSuccess(verificationResult.payment);
                        } else {
                            onFailure('Payment verification failed');
                        }
                    } catch (error) {
                        onFailure(error.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.username || '',
                    email: user?.email || '',
                },
                theme: {
                    color: '#0d6efd'
                },
                modal: {
                    ondismiss: () => {
                        onFailure('Payment cancelled by user');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            onFailure(error.message || 'Failed to initiate payment');
        }
    }

    async updateStatus(orderId, paymentId, status) {
        const response = await api.post('/payment/update-status', {
            orderId,
            paymentId,
            status
        });
        return response.data;
    }
}

export default new PaymentService();

