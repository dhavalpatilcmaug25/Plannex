package com.plannex.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.plannex.models.Review;
import com.plannex.models.User;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByVendor(User vendor);

    List<Review> findByUser(User user);
}
