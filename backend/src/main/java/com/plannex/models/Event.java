package com.plannex.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Double price;
    private String category;
    private String location;
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    @JsonIgnoreProperties({ "portfolio", "reviews", "givenReviews", "roles", "password" })
    private User vendor; // The selected vendor (initially null)

    @ManyToOne
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({ "portfolio", "reviews", "givenReviews", "roles", "password" })
    private User client; // The customer who created the event

    private String status = "OPEN"; // OPEN, BOOKED, COMPLETED

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("event") // Prevent infinite recursion
    private List<EventApplication> applications = new ArrayList<>();

    @ElementCollection
    private List<String> requiredServices = new ArrayList<>();

    public Event() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public User getVendor() {
        return vendor;
    }

    public void setVendor(User vendor) {
        this.vendor = vendor;
    }

    public User getClient() {
        return client;
    }

    public void setClient(User client) {
        this.client = client;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<EventApplication> getApplications() {
        return applications;
    }

    public void setApplications(List<EventApplication> applications) {
        this.applications = applications;
    }

    public List<String> getRequiredServices() {
        return requiredServices;
    }

    public void setRequiredServices(List<String> requiredServices) {
        this.requiredServices = requiredServices;
    }
}
