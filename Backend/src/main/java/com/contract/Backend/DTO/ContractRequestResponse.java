package com.contract.Backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRequestResponse {
    private Long id;
    private String title;
    private String contractType;
    private String description;
    private String status;
    private String priority;
    private UserInfo requestedBy;
    private UserInfo assignedTo;
    private LocalDate dueDate;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class UserInfo {
        private Long id;
        private String fullName;
        private String email;
        private String department;
    }
}