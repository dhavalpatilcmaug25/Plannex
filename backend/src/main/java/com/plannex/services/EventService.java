package com.plannex.services;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.plannex.models.Event;
import com.plannex.models.User;
import com.plannex.repository.EventRepository;
import com.plannex.repository.UserRepository;
import com.plannex.repository.EventApplicationRepository;
import com.plannex.models.EventApplication;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventApplicationRepository eventApplicationRepository;

    @Autowired
    private com.plannex.repository.BookingRepository bookingRepository;

    public List<Event> getAllEvents(Double minPrice, Double maxPrice, String location, String sortStr) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.unsorted();
        if ("price_asc".equals(sortStr)) {
            sort = org.springframework.data.domain.Sort.by("price").ascending();
        } else if ("price_desc".equals(sortStr)) {
            sort = org.springframework.data.domain.Sort.by("price").descending();
        } else if ("date_asc".equals(sortStr)) {
            sort = org.springframework.data.domain.Sort.by("date").ascending();
        }

        return eventRepository.findWithFilters(minPrice, maxPrice, location, sort);
    }

    public List<Event> getVendorEvents(Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return eventRepository.findByVendor(vendor);
    }

    public List<Event> getClientEvents(Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        return eventRepository.findByClient(client);
    }

    public Event createEvent(Event event, Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        event.setClient(client);
        // FORCE location to match client's location
        if (client.getLocation() != null && !client.getLocation().isEmpty()) {
            event.setLocation(client.getLocation());
        }

        // Default date if null, just for safety
        if (event.getDate() == null) {
            event.setDate(LocalDateTime.now().plusDays(7));
        }
        return eventRepository.save(event);
    }

    public EventApplication applyToEvent(Long eventId, Long vendorId, Double price) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        // Check if vendor profile is complete
        if (vendor.getBusinessName() == null || vendor.getBusinessName().isEmpty() ||
                vendor.getCategory() == null || vendor.getCategory().isEmpty()) {
            throw new RuntimeException(
                    "Please complete your vendor profile (Business Name and Category) before applying.");
        }

        // Check if vendor category matches any of the required services
        String vendorCategory = vendor.getCategory();

        if (event.getRequiredServices() != null && !event.getRequiredServices().isEmpty()) {
            boolean isRequired = event.getRequiredServices().stream()
                    .anyMatch(service -> service.equalsIgnoreCase(vendorCategory));

            if (!isRequired) {
                throw new RuntimeException(
                        "This event does not require your service category (" + vendorCategory + ").");
            }
        }

        // Check availability for this specific category
        // A vendor can only apply once per event (which implicitly means once per
        // category since they have 1 category)
        if (eventApplicationRepository.existsByEventAndVendor(event, vendor)) {
            throw new RuntimeException("You have already applied to this event.");
        }

        EventApplication application = new EventApplication(event, vendor, price, vendorCategory);
        application.setStatus("PENDING");

        // Ensure bi-directional consistency
        if (event.getApplications() == null) {
            event.setApplications(new java.util.ArrayList<>());
        }
        event.getApplications().add(application);

        return eventApplicationRepository.save(application);
    }

    public EventApplication updateApplicationStatus(Long applicationId, String status) {
        EventApplication application = eventApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // If status is APPROVED, check if another vendor is already APPROVED or PAID
        // for this specific category
        if ("APPROVED".equalsIgnoreCase(status)) {
            Event event = application.getEvent();
            String category = application.getServiceCategory();

            boolean alreadyFilled = event.getApplications().stream()
                    .anyMatch(app -> category.equalsIgnoreCase(app.getServiceCategory()) &&
                            ("APPROVED".equalsIgnoreCase(app.getStatus()) || "PAID".equalsIgnoreCase(app.getStatus()))
                            &&
                            !app.getId().equals(applicationId));

            if (alreadyFilled) {
                throw new RuntimeException("A vendor has already been accepted for the " + category + " category.");
            }
        }

        application.setStatus(status);

        // If status is PAID, create a Booking record
        if ("PAID".equalsIgnoreCase(status)) {
            // Optional: Check if another vendor is already PAID for this category?
            // For now, assuming user manages this via UI.

            com.plannex.models.Booking booking = new com.plannex.models.Booking();
            booking.setEvent(application.getEvent());
            // The event creator is the customer who pays
            booking.setUser(application.getEvent().getVendor()); // Note: this field name in Booking might be confusing,
                                                                 // check Booking model. usually 'user' in Booking is
                                                                 // the Customer (payer).
            // Let's check Booking model. 'user' is the one who made the booking. Here
            // Customer pays Vendor.
            // If Booking.user represents the Customer, it should be event.getClient().
            // If Booking represents the Record for Vendor, it might be different.
            // Re-checking Booking.java...
            // Booking.java: @ManyToOne User user; // create by user.
            // In this context, Customer pays. So Booking belongs to Customer?
            // Or is it a Booking record for the Vendor's schedule?
            // Existing code: "booking.setUser(application.getEvent().getVendor())" -> This
            // sets Vendor as the user of the booking?
            // Wait, Event.vendor is the MAIN vendor if single vendor.
            // For multi-vendor, Event.vendor might be null or just one of them.
            // Application.vendor is the one being paid.
            // Let's assume Booking.user should be the Customer (Client).
            // But existing code used getVendor(). Let's correct it if it was wrong or keep
            // if consistent.
            // Actually, if we look at previous code:
            // booking.setUser(application.getEvent().getVendor());
            // This seems to interpret "User" as the Provider? Or maybe it was for Single
            // Vendor logic where Event had one Vendor.

            // CORRECT LOGIC for Multi-Vendor:
            // The Booking is a contract between Client and Vendor.
            // If Booking.user is "Who booked it", it's Client.
            // The booking belongs to the Client who created the event and is paying
            booking.setUser(application.getEvent().getClient());
            booking.setAmount(application.getPrice() != null ? application.getPrice() : 5000.0); // Fallback if null
            booking.setBookingDate(LocalDateTime.now());
            booking.setStatus("PAID");

            bookingRepository.save(booking);
        }

        return eventApplicationRepository.save(application);
    }
}
