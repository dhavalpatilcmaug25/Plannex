package com.plannex.controllers;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.plannex.models.ChatMessage;
import com.plannex.models.User;
import com.plannex.repository.ChatRepository;
import com.plannex.repository.UserRepository;
import com.plannex.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public List<ChatMessage> getMessages(@PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
        User otherUser = userRepository.findById(userId).orElseThrow();

        return chatRepository.findConversation(currentUser, otherUser);
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long receiverId = Long.parseLong(payload.get("receiverId").toString());
            String text = (String) payload.get("content"); // Frontend sends 'content'
            // Handle if frontend sends 'text' instead
            if (text == null)
                text = (String) payload.get("text");

            User sender = userRepository.findById(userDetails.getId()).orElseThrow();
            User receiver = userRepository.findById(receiverId).orElseThrow();

            ChatMessage message = new ChatMessage();
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setContent(text);

            return ResponseEntity.ok(chatRepository.save(message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/conversations")
    public List<User> getConversations(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();

        List<User> senders = chatRepository.findSenders(currentUser);
        List<User> receivers = chatRepository.findReceivers(currentUser);

        Set<User> conversationPartners = new HashSet<>();
        conversationPartners.addAll(senders);
        conversationPartners.addAll(receivers);

        return new ArrayList<>(conversationPartners);
    }
}
