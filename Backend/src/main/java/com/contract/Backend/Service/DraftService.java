package com.contract.Backend.Service;

import com.contract.Backend.DTO.DraftResponse;
import com.contract.Backend.DTO.SaveDraftRequest;
import com.contract.Backend.Repository.ContractDraftRepository;
import com.contract.Backend.Repository.ContractRequestRepository;
import com.contract.Backend.Repository.UserRepository;
import com.contract.Backend.model.ContractDraft;
import com.contract.Backend.model.ContractRequest;
import com.contract.Backend.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DraftService {

    private final ContractDraftRepository draftRepository;
    private final ContractRequestRepository requestRepository;
    private final UserRepository userRepository;

    @Transactional
    public DraftResponse saveDraft(SaveDraftRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContractDraft draft = ContractDraft.builder()
                .title(request.getTitle())
                .contractType(request.getContractType())
                .content(request.getContent())
                .createdBy(user)
                .version(1)
                .isFinal(false)
                .build();

        if (request.getDocxBase64() != null && !request.getDocxBase64().isBlank()) {
            try {
                byte[] bytes = Base64.getDecoder().decode(request.getDocxBase64());
                draft.setDocxBytes(bytes);
            } catch (Exception e) {
                log.warn("Failed to decode docxBase64 for draft: {}", e.getMessage());
            }
        }

        if (request.getRequestId() != null) {
            ContractRequest req = requestRepository.findById(request.getRequestId())
                    .orElseThrow(() -> new RuntimeException("Request not found"));
            draft.setContractRequest(req);
        }

        ContractDraft saved = draftRepository.save(draft);
        log.info("Saved draft {} by user {}", saved.getId(), username);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DraftResponse> getMyDrafts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return draftRepository.findByCreatedBy(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DraftResponse> getDraftsByRequest(Long requestId) {
        ContractRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return draftRepository.findByContractRequest(req)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DraftResponse markRequestCompletedWithDraft(Long requestId, Long draftId, String username) {
        // validate user exists
        userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContractRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        ContractDraft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        // link and mark final
        draft.setContractRequest(request);
        draft.setIsFinal(true);
        draftRepository.save(draft);

        // update request status
        request.setStatus(ContractRequest.RequestStatus.COMPLETED);
        requestRepository.save(request);
        log.info("Request {} marked COMPLETED with final draft {}", requestId, draftId);
        return mapToResponse(draft);
    }

    @Transactional(readOnly = true)
    public DraftResponse getFinalDraftForRequest(Long requestId) {
        ContractRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return draftRepository.findByContractRequestOrderByVersionDesc(req)
                .stream()
                .filter(ContractDraft::getIsFinal)
                .findFirst()
                .map(this::mapToResponse)
                .orElse(null);
    }

    private DraftResponse mapToResponse(ContractDraft draft) {
        return DraftResponse.builder()
                .id(draft.getId())
                .title(draft.getTitle())
                .contractType(draft.getContractType())
                .content(draft.getContent())
                .version(draft.getVersion())
                .isFinal(draft.getIsFinal())
                .requestId(draft.getContractRequest() != null ? draft.getContractRequest().getId() : null)
                .hasDocx(draft.getDocxBytes() != null && draft.getDocxBytes().length > 0)
                .createdAt(draft.getCreatedAt())
                .updatedAt(draft.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] getDraftDocx(Long id) {
        ContractDraft draft = draftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draft not found"));
        if (draft.getDocxBytes() == null || draft.getDocxBytes().length == 0) {
            throw new RuntimeException("DOCX not available for this draft");
        }
        return draft.getDocxBytes();
    }

    @Transactional(readOnly = true)
    public String getDraftTitle(Long id) {
        ContractDraft draft = draftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draft not found"));
        return draft.getTitle();
    }
}