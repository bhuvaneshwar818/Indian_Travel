package com.indiantravelai.repository;

import com.indiantravelai.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByTripIdOrderBySentAtAsc(Long tripId);
}
