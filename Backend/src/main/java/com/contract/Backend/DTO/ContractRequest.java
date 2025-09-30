package com.contract.Backend.DTO;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractRequest {
    private String prompt;
    private String contractType; // e.g., "NDA", "Employment", "Service Agreement"
    private String partyA;
    private String partyB;
    // Add any other relevant fields
}