package com.plannex.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    private static final String FROM_EMAIL = "work.dhavalpatil@gmail.com";
    private static final String APP_NAME = "Plannex Events";

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    // Workflow: Customer Registration
    public void sendWelcomeEmail(String toUrl, String name) {
        String subject = "Welcome to " + APP_NAME + "!";
        String body = "Dear " + name + ",\n\n" +
                "Welcome to " + APP_NAME + "! We are thrilled to have you on board.\n\n" +
                "Start exploring vendors and planning your perfect event today.\n\n" +
                "Best regards,\n" +
                "The " + APP_NAME + " Team";
        sendEmail(toUrl, subject, body);
    }

    // Workflow: Customer creates event (notify vendors - conceptual, maybe notify
    // admin or just confirm execution)
    // Since we don't spam all vendors, we'll send a confirmation to the customer
    // instead
    public void sendEventCreatedConfirmation(String to, String name, String eventTitle) {
        String subject = "Event Created: " + eventTitle;
        String body = "Dear " + name + ",\n\n" +
                "Your event '" + eventTitle + "' has been successfully created on " + APP_NAME + ".\n" +
                "Vendors will be able to view details and apply shortly.\n\n" +
                "Best regards,\n" +
                "The " + APP_NAME + " Team";
        sendEmail(to, subject, body);
    }

    // Workflow: Vendor applies (notify customer)
    public void sendVendorAppliedEmail(String customerEmail, String customerName, String vendorName, String eventTitle,
            Double price) {
        String subject = "New Vendor Application for " + eventTitle;
        String body = "Dear " + customerName + ",\n\n" +
                "Great news! Vendor '" + vendorName + "' has applied for your event '" + eventTitle + "'.\n" +
                "Proposed Price: ₹" + price + "\n\n" +
                "Log in to your dashboard to view details and accept or reject this application.\n\n" +
                "Best regards,\n" +
                "The " + APP_NAME + " Team";
        sendEmail(customerEmail, subject, body);
    }

    // Workflow: Vendor approved (notify vendor)
    public void sendVendorApprovedEmail(String vendorEmail, String vendorName, String eventTitle, String customerName) {
        String subject = "Application Accepted: " + eventTitle;
        String body = "Dear " + vendorName + ",\n\n" +
                "Congratulations! Your application for the event '" + eventTitle + "' has been accepted by "
                + customerName + ".\n\n" +
                "You can now proceed with further arrangements. Please check your dashboard for contact details.\n\n" +
                "Best regards,\n" +
                "The " + APP_NAME + " Team";
        sendEmail(vendorEmail, subject, body);
    }

    // Workflow: Vendor Application Rejected (notify vendor)
    public void sendVendorRejectedEmail(String vendorEmail, String vendorName, String eventTitle) {
        String subject = "Application Update: " + eventTitle;
        String body = "Dear " + vendorName + ",\n\n" +
                "Thank you for your interest in the event '" + eventTitle + "'.\n" +
                "Unfortunately, the client has decided to proceed with another vendor for this request.\n\n" +
                "We wish you better luck with future opportunities.\n\n" +
                "Best regards,\n" +
                "The " + APP_NAME + " Team";
        sendEmail(vendorEmail, subject, body);
    }

    // Workflow: Payment Confirmation (notify customer)
    public void sendPaymentConfirmationEmail(String customerEmail, String customerName, String eventTitle,
            Double amount, String transactionId) {
        String subject = "Payment Receipt: " + eventTitle;
        String body = "Dear " + customerName + ",\n\n" +
                "We have received a payment of ₹" + amount + " for the event '" + eventTitle + "'.\n" +
                "Transaction ID: " + transactionId + "\n\n" +
                "Thank you for trusting " + APP_NAME + ".\n\n" +
                "Best regards,\n" +
                "The " + APP_NAME + " Team";
        sendEmail(customerEmail, subject, body);
    }

    // OTP Email using Thymeleaf Template
    @Async
    public void sendOtpEmail(String to, String name, String otp) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("otp", otp);

            String htmlContent = templateEngine.process("otp-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(to);
            helper.setSubject("Plannex - Email Verification");
            helper.setText(htmlContent, true); // true = html

            mailSender.send(message);
            System.out.println("OTP Email sent successfully to " + to);
        } catch (MessagingException e) {
            System.err.println("Failed to send OTP email to " + to + ": " + e.getMessage());
        }
    }
}
