package com.contract.Backend.Controller;

import com.contract.Backend.DTO.ContractRequestDTO;
import com.contract.Backend.DTO.ContractRequestResponse;
import com.contract.Backend.Service.ContractRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    /**
     * Create a new contract request
     * @param request Contract request details
     * @param userId User ID creating the request (from header)
     */
    @PostMapping
    public ResponseEntity<ContractRequestResponse> createRequest(
            @Valid @RequestBody ContractRequestDTO request,
            @RequestHeader("X-User-Id") Long userId) {

        log.info("Creating contract request for user: {}", userId);
        ContractRequestResponse response = contractRequestService.createRequest(request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all requests created by a specific user
     */
    @GetMapping("/my-requests")
    public ResponseEntity<List<ContractRequestResponse>> getMyRequests(
            @RequestHeader("X-User-Id") Long userId) {

        List<ContractRequestResponse> requests = contractRequestService.getMyRequests(userId);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get all pending requests (for legal team)
     */
    @GetMapping("/pending")
    public ResponseEntity<List<ContractRequestResponse>> getPendingRequests() {
        List<ContractRequestResponse> requests = contractRequestService.getPendingRequests();
        return ResponseEntity.ok(requests);
    }

    /**
     * Get all requests (for legal team dashboard)
     */
    @GetMapping
    public ResponseEntity<List<ContractRequestResponse>> getAllRequests() {
        List<ContractRequestResponse> requests = contractRequestService.getAllRequests();
        return ResponseEntity.ok(requests);
    }

    /**
     * Get requests assigned to a specific user
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<ContractRequestResponse>> getAssignedRequests(
            @RequestHeader("X-User-Id") Long userId) {

        List<ContractRequestResponse> requests = contractRequestService.getAssignedRequests(userId);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get a specific request by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContractRequestResponse> getRequest(@PathVariable Long id) {
        ContractRequestResponse request = contractRequestService.getRequestById(id);
        return ResponseEntity.ok(request);
    }

    /**
     * Assign a request to a legal team member
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<ContractRequestResponse> assignRequest(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {

        log.info("Assigning request {} to user {}", id, userId);
        ContractRequestResponse response = contractRequestService.assignRequest(id, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update request status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ContractRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        log.info("Updating request {} status to {}", id, status);
        ContractRequestResponse response = contractRequestService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }
}