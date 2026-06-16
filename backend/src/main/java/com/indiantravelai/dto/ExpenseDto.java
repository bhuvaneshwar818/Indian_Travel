package com.indiantravelai.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseDto {
    private Long id;
    private Long tripId;
    private String description;
    private BigDecimal amount;
    private String category;
    private String paidBy;
    private LocalDate expenseDate;

    public ExpenseDto() {}

    public ExpenseDto(Long id, Long tripId, String description, BigDecimal amount, String category, String paidBy, LocalDate expenseDate) {
        this.id = id;
        this.tripId = tripId;
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.paidBy = paidBy;
        this.expenseDate = expenseDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPaidBy() { return paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
}
