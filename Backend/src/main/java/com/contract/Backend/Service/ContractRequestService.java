package com.contract.Backend.Service;

import com.contract.Backend.DTO.ContractRequestDTO;
import com.contract.Backend.DTO.ContractRequestResponse;

import com.contract.Backend.Repository.ContractRequestRepository;
import com.contract.Backend.Repository.UserRepository;
import com.contract.Backend.model.ContractRequest;
import com.contract.Backend.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractRequestService {

    private final ContractRequestRepository contractRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public ContractRequestResponse createRequest(ContractRequestDTO dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContractRequest request = ContractRequest.builder()
                .title(dto.getTitle())
                .contractType(dto.getContractType())
                .description(dto.getDescription())
                .priority(ContractRequest.Priority.valueOf(dto.getPriority().toUpperCase()))
                .dueDate(dto.getDueDate())
                .tags(dto.getTags())
                .requestedBy(user)
                .status(ContractRequest.RequestStatus.PENDING)
                .build();

        ContractRequest saved = contractRequestRepository.save(request);
        log.info("Created contract request: {} by user: {}", saved.getId(), username);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ContractRequestResponse> getMyRequests(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return contractRequestRepository.findByRequestedBy(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContractRequestResponse> getPendingRequests() {
        return contractRequestRepository.findByStatus(ContractRequest.RequestStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContractRequestResponse> getAssignedRequests(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return contractRequestRepository.findByAssignedTo(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContractRequestResponse assignRequest(Long requestId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContractRequest request = contractRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setAssignedTo(user);
        request.setStatus(ContractRequest.RequestStatus.IN_PROGRESS);

        ContractRequest updated = contractRequestRepository.save(request);
        log.info("Assigned request {} to user {}", requestId, username);

        return mapToResponse(updated);
    }

    @Transactional
    public ContractRequestResponse updateStatus(Long requestId, String status) {
        ContractRequest request = contractRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(ContractRequest.RequestStatus.valueOf(status.toUpperCase()));
        ContractRequest updated = contractRequestRepository.save(request);

        return mapToResponse(updated);
    }

    private ContractRequestResponse mapToResponse(ContractRequest request) {
        return ContractRequestResponse.builder()
                .id(request.getId())
                .title(request.getTitle())
                .contractType(request.getContractType())
                .description(request.getDescription())
                .status(request.getStatus().name().toLowerCase())
                .priority(request.getPriority().name().toLowerCase())
                .requestedBy(mapUserInfo(request.getRequestedBy()))
                .assignedTo(request.getAssignedTo() != null ?
                        mapUserInfo(request.getAssignedTo()) : null)
                .dueDate(request.getDueDate())
                .tags(request.getTags())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }

    private ContractRequestResponse.UserInfo mapUserInfo(User user) {
        return ContractRequestResponse.UserInfo.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .build();
    }
}