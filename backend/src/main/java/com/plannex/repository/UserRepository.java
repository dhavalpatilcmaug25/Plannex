package com.plannex.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.plannex.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
        Optional<User> findByUsername(String username);

        Optional<User> findByEmail(String email);

        Boolean existsByUsername(String username);

        Boolean existsByEmail(String email);

        @org.springframework.data.jpa.repository.Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = com.plannex.models.ERole.ROLE_VENDOR AND u.isApproved = true AND u.isSuspended = false AND "
                        +
                        "(:minPrice IS NULL OR u.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR u.price <= :maxPrice) AND " +
                        "(:location IS NULL OR :location = '' OR LOWER(TRIM(u.location)) = LOWER(TRIM(:location))) AND "
                        +
                        "(:search IS NULL OR :search = '' OR LOWER(u.businessName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.category) LIKE LOWER(CONCAT('%', :search, '%'))) AND "
                        +
                        "(:category IS NULL OR :category = '' OR u.category = :category)")
        java.util.List<User> findVendorsWithFilters(
                        @org.springframework.data.repository.query.Param("minPrice") Double minPrice,
                        @org.springframework.data.repository.query.Param("maxPrice") Double maxPrice,
                        @org.springframework.data.repository.query.Param("location") String location,
                        @org.springframework.data.repository.query.Param("search") String search,
                        @org.springframework.data.repository.query.Param("category") String category,
                        org.springframework.data.domain.Sort sort);
}
