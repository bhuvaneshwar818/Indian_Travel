package com.indiantravelai.repository;

import com.indiantravelai.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByTripIdOrderByExpenseDateDesc(Long tripId);
    
    @Query("SELECT e FROM Expense e WHERE e.trip.user.username = :username ORDER BY e.expenseDate DESC")
    List<Expense> findByTripUserUsernameOrderByExpenseDateDesc(@Param("username") String username);
}
