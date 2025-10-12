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
public class DraftResponse {
    private Long id;
    private String title;
    private String contractType;
    private String content;
    private Integer version;
    private Boolean isFinal;
    private Long requestId;
    private Boolean hasDocx;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}