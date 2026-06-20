package com.indiantravelai.service;

import com.indiantravelai.entity.Destination;
import com.indiantravelai.repository.DestinationRepositoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DestinationService {

    @Autowired
    private DestinationRepositoryImpl destinationRepository;

    public List<Destination> getAll() {
        return destinationRepository.findAll();
    }

    public List<Destination> getByState(String state) {
        return destinationRepository.findByStateIgnoreCase(state);
    }

    public List<Destination> getByCategory(String category) {
        return destinationRepository.findByCategoryIgnoreCase(category);
    }

    public List<Destination> getByStateAndCategory(String state, String category) {
        if ((state == null || state.isBlank() || state.equalsIgnoreCase("all")) 
            && (category == null || category.isBlank() || category.equalsIgnoreCase("all"))) {
            return getAll();
        } else if (state == null || state.isBlank() || state.equalsIgnoreCase("all")) {
            return getByCategory(category);
        } else if (category == null || category.isBlank() || category.equalsIgnoreCase("all")) {
            return getByState(state);
        }
        return destinationRepository.findByStateIgnoreCaseAndCategoryIgnoreCase(state, category);
    }

    public Destination getById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found with id: " + id));
    }

    public Destination addDestination(Destination destination) {
        return destinationRepository.save(destination);
    }
}
