package com.plannex.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.plannex.models.Booking;
import com.plannex.models.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);

    List<Booking> findByEvent_Vendor(User vendor);

    boolean existsByUserAndEvent_VendorAndStatus(User user, User vendor, String status);

    boolean existsByUserIdAndEvent_VendorIdAndStatus(Long userId, Long vendorId, String status);

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b WHERE b.event.vendor = :vendor AND b.event.date BETWEEN :start AND :end AND b.status = :status")
    boolean existsByEvent_VendorAndEvent_DateBetweenAndStatus(User vendor, java.time.LocalDateTime start,
            java.time.LocalDateTime end, String status);

    List<Booking> findByEvent(com.plannex.models.Event event);

    java.util.Optional<Booking> findByEventAndUser(com.plannex.models.Event event, User user);
}
