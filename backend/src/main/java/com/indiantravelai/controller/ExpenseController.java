package com.indiantravelai.controller;

import com.indiantravelai.dto.ExpenseDto;
import com.indiantravelai.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> getExpenses(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(expenseService.getExpenses(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> addExpense(@RequestBody ExpenseDto dto, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(expenseService.addExpense(principal.getName(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            expenseService.deleteExpense(principal.getName(), id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Expense deleted successfully.");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getExpenseSummary(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(expenseService.getExpenseSummary(principal.getName()));
    }
}
