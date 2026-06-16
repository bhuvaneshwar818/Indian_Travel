package com.indiantravelai.repository;

import com.indiantravelai.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUserUsernameOrderByCreatedAtDesc(String username);
    List<Trip> findByUserIdOrderByCreatedAtDesc(Long userId);
}
