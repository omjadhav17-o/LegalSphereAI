package com.contract.Backend.Controller;

import com.contract.Backend.DTO.ContractRequest;
import com.contract.Backend.DTO.ContractResponse;
import com.contract.Backend.Service.ContractDraftingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Configure appropriately for production
public class ContractController {

    private final ContractDraftingService contractDraftingService;

    @PostMapping("/draft")
    public ResponseEntity<ContractResponse> draftContract(
             @RequestBody ContractRequest request) {

//        log.info("Received contract drafting request: {}", request.getPrompt());

        try {
            ContractResponse response = contractDraftingService.draftContract(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
//            log.error("Error processing contract request", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ContractResponse.builder()
                            .rawContent("Error: " + e.getMessage())
                            .build());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Contract Drafting API is running");
    }
}