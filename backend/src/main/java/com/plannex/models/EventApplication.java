package com.plannex.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "event_applications")
public class EventApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id")
    @JsonIgnoreProperties("applications")
    private Event event;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id")
    @JsonIgnoreProperties({ "password", "roles", "portfolio", "reviews", "givenReviews" }) // Reduce payload size and
                                                                                           // prevent recursion
    private User vendor;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED

    private LocalDateTime appliedAt = LocalDateTime.now();

    // Convenience field as seen in frontend usage
    private String vendorEmail;

    private Double price;

    private String serviceCategory; // NEW: The specific category this application is for

    public EventApplication() {
    }

    public EventApplication(Event event, User vendor, Double price, String serviceCategory) {
        this.event = event;
        this.vendor = vendor;
        this.vendorEmail = vendor.getEmail();
        this.price = price;
        this.serviceCategory = serviceCategory;
        this.appliedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public User getVendor() {
        return vendor;
    }

    public void setVendor(User vendor) {
        this.vendor = vendor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public String getVendorEmail() {
        return vendorEmail;
    }

    public void setVendorEmail(String vendorEmail) {
        this.vendorEmail = vendorEmail;
    }

    public Long getVendorId() {
        return vendor != null ? vendor.getId() : null;
    }

    public String getVendorName() {
        return vendor != null ? (vendor.getBusinessName() != null ? vendor.getBusinessName() : vendor.getUsername())
                : null;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }
}
