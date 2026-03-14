package com.plannex.controllers;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.plannex.models.Payment;
import com.plannex.services.PaymentService;
import com.plannex.models.User;
import com.plannex.models.Event;
import com.plannex.repository.UserRepository;
import com.plannex.repository.EventRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.plannex.services.EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            Double amount = Double.parseDouble(data.get("amount").toString());
            Long userId = Long.parseLong(data.get("userId").toString());
            Long eventId = data.containsKey("eventId") ? Long.parseLong(data.get("eventId").toString()) : null;
            Long applicationId = data.containsKey("applicationId")
                    ? Long.parseLong(data.get("applicationId").toString())
                    : null;

            Payment payment = paymentService.createOrder(amount, userId, eventId, applicationId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/update-status")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, String> data) {
        try {
            String orderId = data.get("orderId");
            String paymentId = data.get("paymentId");
            String status = data.get("status");

            Payment payment = paymentService.updatePaymentStatus(orderId, paymentId, status);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/key")
    public ResponseEntity<?> getKey() {
        return ResponseEntity.ok(Map.of("key", paymentService.getKeyId()));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            String orderId = data.get("razorpay_order_id");
            String paymentId = data.get("razorpay_payment_id");
            String signature = data.get("razorpay_signature");

            Payment payment = paymentService.processSuccessfulPayment(orderId, paymentId, signature);

            // Send Email
            try {
                User user = userRepository.findById(payment.getUserId()).orElse(null);
                Event event = eventRepository.findById(payment.getEventId()).orElse(null);
                if (user != null && event != null) {
                    emailService.sendPaymentConfirmationEmail(
                            user.getEmail(),
                            user.getUsername(),
                            event.getTitle(),
                            payment.getAmount(),
                            payment.getOrderId());
                }
            } catch (Exception ex) {
                System.err.println("Failed to send payment email: " + ex.getMessage());
            }

            return ResponseEntity.ok(Map.of("success", true, "payment", payment));

        } catch (Exception e) {
            e.printStackTrace(); // Log error to console for debugging
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
