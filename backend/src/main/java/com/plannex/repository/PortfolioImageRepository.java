package com.plannex.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.plannex.models.PortfolioImage;
import com.plannex.models.User;

@Repository
public interface PortfolioImageRepository extends JpaRepository<PortfolioImage, Long> {
    List<PortfolioImage> findByVendor(User vendor);
}
