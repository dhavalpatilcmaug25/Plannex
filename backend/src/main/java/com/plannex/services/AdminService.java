package com.plannex.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.plannex.dto.SystemStatsDto;
import com.plannex.models.ERole;
import com.plannex.models.User;
import com.plannex.repository.UserRepository;

@Service
public class AdminService {

    @Autowired
    private com.plannex.repository.BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<com.plannex.models.Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public User verifyVendor(Long userId, boolean approve) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure user is actually a vendor
        boolean isVendor = user.getRoles().stream()
                .anyMatch(r -> r.getName() == ERole.ROLE_VENDOR);

        if (!isVendor) {
            throw new RuntimeException("User is not a vendor");
        }

        user.setApproved(approve);
        return userRepository.save(user);
    }

    public User suspendUser(Long userId, boolean suspend) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSuspended(suspend);
        return userRepository.save(user);
    }

    public SystemStatsDto getSystemStats() {
        long totalUsers = userRepository.count();
        // naive approach for vendors count, better to use custom query in repo
        long totalVendors = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_VENDOR))
                .count();

        List<com.plannex.models.Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();

        // Calculate total revenue from PAID bookings
        double totalRevenue = allBookings.stream()
                .filter(b -> "PAID".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(com.plannex.models.Booking::getAmount)
                .sum();

        SystemStatsDto stats = new SystemStatsDto(totalUsers, totalVendors);
        stats.setTotalBookings(totalBookings);
        stats.setTotalRevenue(totalRevenue);

        return stats;
    }
}
