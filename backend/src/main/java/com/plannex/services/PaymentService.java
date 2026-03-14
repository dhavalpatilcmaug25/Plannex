package com.plannex.services;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.plannex.models.Payment;
import com.plannex.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@Service
public class PaymentService {

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingService bookingService;

    public Payment createOrder(Double amount, Long userId, Long eventId, Long applicationId) throws RazorpayException {
        RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount * 100); // Amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1); // Auto capture

        Order order = razorpay.orders.create(orderRequest);

        Payment payment = new Payment(
                order.get("id"),
                amount,
                "INR",
                "CREATED",
                userId,
                eventId,
                applicationId);

        return paymentRepository.save(payment);
    }

    public Payment updatePaymentStatus(String orderId, String paymentId, String status) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment Order not found"));

        payment.setPaymentId(paymentId);
        payment.setStatus(status);
        return paymentRepository.save(payment);
    }

    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return com.razorpay.Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            return false;
        }
    }

    public Payment processSuccessfulPayment(String orderId, String paymentId, String signature) throws Exception {
        if (!verifyPaymentSignature(orderId, paymentId, signature)) {
            throw new Exception("Invalid Payment Signature");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment Order not found"));

        if (!"PAID".equals(payment.getStatus())) {
            payment.setPaymentId(paymentId);
            payment.setStatus("PAID");
            paymentRepository.save(payment);

            // Trigger Booking Creation
            bookingService.createBookingFromPayment(payment);
        }

        return payment;
    }

    public String getKeyId() {
        return keyId;
    }
}
