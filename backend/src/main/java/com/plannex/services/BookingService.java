package com.plannex.services;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.plannex.models.Booking;
import com.plannex.models.Event;
import com.plannex.models.User;
import com.plannex.repository.BookingRepository;
import com.plannex.repository.EventRepository;
import com.plannex.repository.UserRepository;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.plannex.repository.EventApplicationRepository eventApplicationRepository;

    public Booking createBooking(Long userId, Long eventId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setStatus("PENDING");
        booking.setBookingDate(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public Booking createBookingFromPayment(com.plannex.models.Payment payment) {
        if (payment.getApplicationId() == null) {
            throw new RuntimeException("Payment does not have an associated application ID");
        }

        com.plannex.models.EventApplication application = eventApplicationRepository
                .findById(payment.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Event Application not found"));

        Event event = application.getEvent();
        User vendor = application.getVendor();

        // CHECK FOR EXISTING BOOKING (Balance Payment)
        List<Booking> existingBookings = bookingRepository.findByEvent(event);
        for (Booking existing : existingBookings) {
            if (("ADVANCE_PAID".equals(existing.getStatus()) || "WORK_COMPLETED".equals(existing.getStatus()))
                    && existing.getEvent().getVendor().getId().equals(vendor.getId())) {
                // Update to PAID
                existing.setStatus("PAID");
                existing.setPaidAmount(
                        (existing.getPaidAmount() != null ? existing.getPaidAmount() : 0.0) + payment.getAmount());
                existing.setRemainingAmount(0.0);
                bookingRepository.save(existing);

                application.setStatus("PAID");
                eventApplicationRepository.save(application);

                return existing;
            }
        }

        // 0. Double Booking Prevention
        java.time.LocalDateTime eventDate = event.getDate();
        if (eventDate != null) {
            java.time.LocalDateTime startOfDay = eventDate.toLocalDate().atStartOfDay();
            java.time.LocalDateTime endOfDay = startOfDay.plusDays(1);

            System.out.println("DEBUG: Checking double booking for Vendor ID: " + vendor.getId() + " Date: "
                    + startOfDay.toLocalDate());

            boolean isBooked = bookingRepository.existsByEvent_VendorAndEvent_DateBetweenAndStatus(
                    vendor, startOfDay, endOfDay, "CONFIRMED");
            boolean isAdvancePaid = bookingRepository.existsByEvent_VendorAndEvent_DateBetweenAndStatus(
                    vendor, startOfDay, endOfDay, "ADVANCE_PAID");

            if (isBooked || isAdvancePaid) {
                System.out.println("DEBUG: Double booking detected!");
                throw new RuntimeException("Vendor is already booked for this date (" + eventDate.toLocalDate()
                        + "). Payment received but booking failed.");
            }
        }

        // 1. Create New Booking (First Payment)
        System.out.println("DEBUG: Creating Booking...");
        Booking booking = new Booking();
        booking.setEvent(event);
        booking.setUser(event.getClient() != null ? event.getClient() : event.getVendor());
        booking.setAmount(application.getPrice());
        booking.setBookingDate(LocalDateTime.now());

        if (payment.getAmount() < application.getPrice()) {
            booking.setStatus("ADVANCE_PAID");
            booking.setPaidAmount(payment.getAmount());
            booking.setRemainingAmount(application.getPrice() - payment.getAmount());
            application.setStatus("ADVANCE_PAID");
        } else {
            booking.setStatus("PAID");
            booking.setPaidAmount(payment.getAmount());
            booking.setRemainingAmount(0.0);
            application.setStatus("PAID");
        }

        bookingRepository.save(booking);

        // 2. Update Event Status and Selected Vendor
        event.setStatus("BOOKED");
        event.setVendor(application.getVendor());
        eventRepository.save(event);

        // 3. Update Application Status
        eventApplicationRepository.save(application);

        // 4. Reject other applications
        List<com.plannex.models.EventApplication> otherApps = eventApplicationRepository.findByEvent(event);
        for (com.plannex.models.EventApplication app : otherApps) {
            if (!app.getId().equals(application.getId()) && "PENDING".equals(app.getStatus())) {
                app.setStatus("REJECTED");
                eventApplicationRepository.save(app);
            }
        }

        return booking;
    }

    public List<Booking> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user);
    }

    public List<Booking> getVendorBookings(Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        // Assuming connection via event->vendor
        return bookingRepository.findByEvent_Vendor(vendor);
    }

    public Booking updateStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Sync with Application Status
        Event event = booking.getEvent();
        User vendor = event.getVendor();

        List<com.plannex.models.EventApplication> apps = eventApplicationRepository.findByEvent(event);
        for (com.plannex.models.EventApplication app : apps) {
            if (app.getVendor().getId().equals(vendor.getId())) {
                app.setStatus(status);
                eventApplicationRepository.save(app);
                break;
            }
        }

        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public Booking getBookingByEventAndVendor(Event event, User vendor) {
        return bookingRepository.findByEventAndUser(event, vendor).orElse(null);
    }

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }
}
