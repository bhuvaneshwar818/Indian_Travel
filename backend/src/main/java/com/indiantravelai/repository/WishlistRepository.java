package com.indiantravelai.repository;

import com.indiantravelai.model.WishlistPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface WishlistRepository extends JpaRepository<WishlistPlace, Long> {
    List<WishlistPlace> findByTripIdOrderBySortOrderAsc(Long tripId);
    
    @Query("SELECT wp FROM WishlistPlace wp WHERE wp.trip.user.username = :username ORDER BY wp.sortOrder ASC")
    List<WishlistPlace> findByTripUserUsernameOrderBySortOrderAsc(@Param("username") String username);
}
