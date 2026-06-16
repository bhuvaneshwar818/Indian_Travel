package com.indiantravelai.repository;

import com.indiantravelai.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserUsername(String username);
    boolean existsByUserUsernameAndDestinationId(String username, Long destinationId);
    void deleteByUserUsernameAndDestinationId(String username, Long destinationId);
}
