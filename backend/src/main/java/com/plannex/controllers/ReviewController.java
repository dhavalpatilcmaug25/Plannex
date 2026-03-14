package com.plannex.controllers;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.plannex.models.Review;
import com.plannex.models.User;
import com.plannex.repository.ReviewRepository;
import com.plannex.repository.UserRepository;
import com.plannex.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/review")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.plannex.repository.BookingRepository bookingRepository;

    @Autowired
    private com.plannex.repository.EventApplicationRepository eventApplicationRepository;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long vendorId = Long.parseLong(payload.getOrDefault("vendorId", "0").toString());
            String content = (String) payload.getOrDefault("content", payload.get("comment"));
            int rating = Integer.parseInt(payload.getOrDefault("rating", "0").toString());

            if (vendorId == 0 || rating == 0 || content == null) {
                return ResponseEntity.badRequest()
                        .body("Missing required fields: vendorId, rating, or comment/content");
            }

            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            User vendor = userRepository.findById(vendorId).orElseThrow(() -> new RuntimeException("Vendor not found"));

            System.out.println("DEBUG: Review Validation - User: " + user.getId() + ", Vendor: " + vendorId);

            // 1. Check if user has any interaction in Booking table
            boolean hasBooking = bookingRepository.existsByUserIdAndEvent_VendorIdAndStatus(user.getId(), vendorId,
                    "CONFIRMED") ||
                    bookingRepository.existsByUserIdAndEvent_VendorIdAndStatus(user.getId(), vendorId, "ADVANCE_PAID")
                    ||
                    bookingRepository.existsByUserIdAndEvent_VendorIdAndStatus(user.getId(), vendorId, "PAID") ||
                    bookingRepository.existsByUserIdAndEvent_VendorIdAndStatus(user.getId(), vendorId,
                            "WORK_COMPLETED");

            System.out
                    .println("DEBUG: Booking Interaction Checking for User: " + user.getId() + " Vendor: " + vendorId);
            System.out.println("DEBUG: Result: " + hasBooking);

            // 2. Check if user has any interaction in Application table (backup check)
            boolean hasApplication = eventApplicationRepository.findByEvent_Client(user).stream()
                    .anyMatch(app -> app.getVendor().getId().equals(vendorId) &&
                            (app.getStatus().equals("PAID") || app.getStatus().equals("ADVANCE_PAID")
                                    || app.getStatus().equals("CONFIRMED")
                                    || app.getStatus().equals("WORK_COMPLETED")));

            if (!hasBooking && !hasApplication) {
                System.out.println("DEBUG: Review Failed - No interaction found for User " + user.getId()
                        + " and Vendor " + vendorId);
                return ResponseEntity.badRequest()
                        .body("You can only review vendors you have interacted with via bookings (Paid/Advance Paid).");
            }

            Review review = new Review();
            review.setUser(user);
            review.setVendor(vendor);
            review.setContent(content);
            review.setRating(rating);

            return ResponseEntity.ok(reviewRepository.save(review));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error submitting review: " + e.getMessage());
        }
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Review> getVendorReviews(@PathVariable Long vendorId) {
        User vendor = userRepository.findById(vendorId).orElseThrow(() -> new RuntimeException("Vendor not found"));
        return reviewRepository.findByVendor(vendor);
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('USER')")
    public List<Review> getMyReviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return reviewRepository.findByUser(user);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }
}
