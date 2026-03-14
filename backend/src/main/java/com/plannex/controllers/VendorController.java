package com.plannex.controllers;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.plannex.models.ERole;
import com.plannex.models.User;
import com.plannex.repository.UserRepository;
import com.plannex.security.services.UserDetailsImpl;
import com.plannex.payload.request.VendorProfileRequest;
import com.plannex.models.PortfolioImage;
import com.plannex.repository.PortfolioImageRepository;
import com.plannex.payload.response.MessageResponse;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/vendor")
public class VendorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PortfolioImageRepository portfolioImageRepository;

    @GetMapping
    public List<User> getAllVendors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String sort) {

        System.out.println("DEBUG: getAllVendors called");
        System.out.println(
                "DEBUG params - Location: '" + location + "', Search: '" + search + "', Category: '" + category + "'");

        org.springframework.data.domain.Sort sortObj = org.springframework.data.domain.Sort.unsorted();
        if ("price_asc".equals(sort)) {
            sortObj = org.springframework.data.domain.Sort.by("price").ascending();
        } else if ("price_desc".equals(sort)) {
            sortObj = org.springframework.data.domain.Sort.by("price").descending();
        }

        java.util.List<User> results = userRepository.findVendorsWithFilters(minPrice, maxPrice, location, search,
                category, sortObj);
        System.out.println("DEBUG: Found " + results.size() + " vendors after filtering");
        return results;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVendor(@PathVariable Long id) {
        User vendor = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Vendor not found"));
        if (vendor.getRoles().stream().noneMatch(r -> r.getName() == ERole.ROLE_VENDOR)) {
            return ResponseEntity.badRequest().body("User is not a vendor");
        }
        return ResponseEntity.ok(vendor);
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User vendor = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(vendor);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateVendor(@PathVariable Long id, @RequestBody VendorProfileRequest profileRequest) {
        User vendor = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Vendor not found"));

        // Optimize: Check if the logged-in user matches the ID or is Admin

        vendor.setBusinessName(profileRequest.getBusinessName());
        vendor.setCategory(profileRequest.getCategory());
        vendor.setPrice(profileRequest.getPrice());
        vendor.setImageUrl(profileRequest.getImageUrl());
        vendor.setLocation(profileRequest.getLocation());

        userRepository.save(vendor);
        return ResponseEntity.ok(vendor);
    }

    @PostMapping("/portfolio")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> addPortfolioImage(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> request) {
        String imageUrl = request.get("imageUrl");
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Image URL is required"));
        }

        User vendor = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        PortfolioImage portfolioImage = new PortfolioImage(imageUrl, vendor);
        portfolioImageRepository.save(portfolioImage);

        return ResponseEntity.ok(portfolioImage);
    }

    @DeleteMapping("/portfolio/{imageId}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> removePortfolioImage(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long imageId) {
        PortfolioImage image = portfolioImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Error: Image not found"));

        if (!image.getVendor().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Unauthorized to delete this image"));
        }

        portfolioImageRepository.delete(image);
        return ResponseEntity.ok(new MessageResponse("Portfolio image deleted successfully"));
    }
}
