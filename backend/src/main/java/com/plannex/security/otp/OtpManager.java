package com.plannex.security.otp;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpManager {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 3;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    private final Map<String, OtpData> otpCache = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateOtp(String email) {
        // Check cooldown
        if (otpCache.containsKey(email)) {
            OtpData existing = otpCache.get(email);
            if (existing.lastSent.plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
                throw new RuntimeException("Please wait " + RESEND_COOLDOWN_SECONDS + " seconds before resending OTP.");
            }
        }

        String otp = String.format("%06d", secureRandom.nextInt(999999));
        otpCache.put(email, new OtpData(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        if (!otpCache.containsKey(email)) {
            return false;
        }

        OtpData data = otpCache.get(email);

        if (LocalDateTime.now().isAfter(data.expiryTime)) {
            otpCache.remove(email);
            return false;
        }

        if (data.attempts >= MAX_ATTEMPTS) {
            otpCache.remove(email); // Max attempts reached, invalidate
            return false;
        }

        data.attempts++;

        if (data.otp.equals(otp)) {
            otpCache.remove(email); // Success, remove
            return true;
        }

        return false;
    }

    public void clearOtp(String email) {
        otpCache.remove(email);
    }

    // Scheduled cleanup every minute
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        otpCache.entrySet().removeIf(entry -> now.isAfter(entry.getValue().expiryTime));
    }

    private static class OtpData {
        String otp;
        LocalDateTime expiryTime;
        LocalDateTime lastSent;
        int attempts;

        OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
            this.lastSent = LocalDateTime.now();
            this.attempts = 0;
        }
    }
}
