package com.contract.Backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateResponse {
    private Long id;
    private String title;
    private String contractType;
    private String description;
    private String content;
    private Integer timesUsed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}