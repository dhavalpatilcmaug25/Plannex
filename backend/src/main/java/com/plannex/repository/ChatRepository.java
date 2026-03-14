package com.plannex.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.plannex.models.ChatMessage;
import com.plannex.models.User;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
    @Query("SELECT c FROM ChatMessage c WHERE (c.sender = ?1 AND c.receiver = ?2) OR (c.sender = ?2 AND c.receiver = ?1) ORDER BY c.timestamp ASC")
    List<ChatMessage> findConversation(User user1, User user2);

    // Find unique conversation partners for a user
    @Query("SELECT DISTINCT c.sender FROM ChatMessage c WHERE c.receiver = ?1")
    List<User> findSenders(User receiver);

    @Query("SELECT DISTINCT c.receiver FROM ChatMessage c WHERE c.sender = ?1")
    List<User> findReceivers(User sender);
}
