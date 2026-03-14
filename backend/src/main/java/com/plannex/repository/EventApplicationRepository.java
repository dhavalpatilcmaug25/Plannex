package com.plannex.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.plannex.models.EventApplication;
import com.plannex.models.Event;
import com.plannex.models.User;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventApplicationRepository extends JpaRepository<EventApplication, Long> {
    List<EventApplication> findByEvent(Event event);

    List<EventApplication> findByVendor(User vendor);

    Optional<EventApplication> findByEventAndVendor(Event event, User vendor);

    boolean existsByEventAndVendor(Event event, User vendor);

    List<EventApplication> findByEvent_Vendor(User user);

    List<EventApplication> findByEvent_Client(User user);

    boolean existsByVendorAndStatusAndEvent_DateBetween(User vendor, String status, java.time.LocalDateTime start,
            java.time.LocalDateTime end);
}
