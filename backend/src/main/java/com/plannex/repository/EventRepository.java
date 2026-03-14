package com.plannex.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.plannex.models.Event;
import com.plannex.models.User;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
        List<Event> findByVendor(User vendor);

        List<Event> findByClient(User client);

        @org.springframework.data.jpa.repository.Query("SELECT e FROM Event e WHERE " +
                        "(:minPrice IS NULL OR e.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR e.price <= :maxPrice) AND " +
                        "(:location IS NULL OR LOWER(e.location) = LOWER(:location))")
        List<Event> findWithFilters(Double minPrice, Double maxPrice, String location,
                        org.springframework.data.domain.Sort sort);
}
