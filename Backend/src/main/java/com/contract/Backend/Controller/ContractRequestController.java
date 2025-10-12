package com.contract.Backend.Controller;

import com.contract.Backend.DTO.ContractRequestDTO;
import com.contract.Backend.DTO.ContractRequestResponse;
import com.contract.Backend.Service.ContractRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
@Validated
@Slf4j
public class ContractRequestController {

    private final ContractRequestService contractRequestService;

    @PostMapping
    public ResponseEntity<ContractRequestResponse> createRequest(
            @Valid @RequestBody ContractRequestDTO request,
            @RequestHeader("X-USER") String username) {

        ContractRequestResponse response = contractRequestService.createRequest(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<ContractRequestResponse>> getMyRequests(
            @RequestHeader("X-USER") String username) {

        List<ContractRequestResponse> requests = contractRequestService.getMyRequests(username);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ContractRequestResponse>> getPendingRequests() {
        List<ContractRequestResponse> requests = contractRequestService.getPendingRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<ContractRequestResponse>> getAssignedRequests(
            @RequestHeader("X-USER") String username) {
        List<ContractRequestResponse> requests = contractRequestService.getAssignedRequests(username);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ContractRequestResponse> assignRequest(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        ContractRequestResponse response = contractRequestService.assignRequest(id, username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ContractRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        ContractRequestResponse response = contractRequestService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }
}