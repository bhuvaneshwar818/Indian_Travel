package com.indiantravelai.service;

import com.indiantravelai.dto.ExpenseDto;
import com.indiantravelai.entity.Trip;
import com.indiantravelai.entity.User;
import com.indiantravelai.model.Expense;
import com.indiantravelai.repository.ExpenseRepository;
import com.indiantravelai.repository.TripRepository;
import com.indiantravelai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TripService tripService;

    public List<ExpenseDto> getExpenses(String username) {
        Trip trip = tripService.getOrCreateActiveTrip(username);
        List<Expense> expenses = expenseRepository.findByTripIdOrderByExpenseDateDesc(trip.getId());
        return expenses.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseDto addExpense(String username, ExpenseDto dto) {
        Trip trip = tripService.getOrCreateActiveTrip(username);
        Expense expense = new Expense(
                trip,
                dto.getDescription(),
                dto.getAmount() != null ? dto.getAmount() : BigDecimal.ZERO,
                dto.getCategory() != null ? dto.getCategory() : "Other",
                dto.getPaidBy() != null ? dto.getPaidBy() : "Me",
                dto.getExpenseDate() != null ? dto.getExpenseDate() : LocalDate.now()
        );
        Expense saved = expenseRepository.save(expense);
        return convertToDto(saved);
    }

    @Transactional
    public void deleteExpense(String username, Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        if (!expense.getTrip().getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete expense");
        }
        expenseRepository.delete(expense);
    }

    public Map<String, Object> getExpenseSummary(String username) {
        Trip trip = tripService.getOrCreateActiveTrip(username);
        List<Expense> expenses = expenseRepository.findByTripIdOrderByExpenseDateDesc(trip.getId());

        BigDecimal total = BigDecimal.ZERO;
        Map<String, BigDecimal> categories = new HashMap<>();
        
        // Initialize categories with zero
        categories.put("Food", BigDecimal.ZERO);
        categories.put("Transport", BigDecimal.ZERO);
        categories.put("Stay", BigDecimal.ZERO);
        categories.put("Entry", BigDecimal.ZERO);
        categories.put("Other", BigDecimal.ZERO);

        for (Expense e : expenses) {
            BigDecimal amt = e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO;
            total = total.add(amt);
            
            String cat = e.getCategory();
            if (cat == null || !categories.containsKey(cat)) {
                cat = "Other";
            }
            categories.put(cat, categories.get(cat).add(amt));
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSpent", total);
        summary.put("categoryBreakdown", categories);
        
        // Split calculations
        String mode = trip.getTravelMode();
        Integer size = trip.getGroupSize();
        if (size == null || size < 1) size = 1;
        
        summary.put("travelMode", mode != null ? mode : "SOLO");
        summary.put("groupSize", size);
        
        BigDecimal perPerson = total;
        if ("GROUP".equalsIgnoreCase(mode) && size > 1) {
            perPerson = total.divide(BigDecimal.valueOf(size), 2, RoundingMode.HALF_UP);
        }
        summary.put("perPersonSplit", perPerson);

        return summary;
    }

    private ExpenseDto convertToDto(Expense e) {
        return new ExpenseDto(
                e.getId(),
                e.getTrip().getId(),
                e.getDescription(),
                e.getAmount(),
                e.getCategory(),
                e.getPaidBy(),
                e.getExpenseDate()
        );
    }
}
