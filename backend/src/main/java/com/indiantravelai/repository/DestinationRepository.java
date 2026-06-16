package com.indiantravelai.repository;

import com.indiantravelai.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    List<Destination> findByStateIgnoreCase(String state);
    List<Destination> findByCategoryIgnoreCase(String category);
    List<Destination> findByStateIgnoreCaseAndCategoryIgnoreCase(String state, String category);
}
