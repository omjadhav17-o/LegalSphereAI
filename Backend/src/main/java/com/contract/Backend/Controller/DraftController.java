package com.contract.Backend.Controller;

import com.contract.Backend.DTO.DraftResponse;
import com.contract.Backend.DTO.SaveDraftRequest;
import com.contract.Backend.Service.DraftService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/drafts")
@RequiredArgsConstructor
@Validated
@Slf4j
public class DraftController {

    private final DraftService draftService;

    @PostMapping
    public ResponseEntity<DraftResponse> saveDraft(
            @Valid @RequestBody SaveDraftRequest request,
            @RequestHeader("X-USER") String username) {
        DraftResponse response = draftService.saveDraft(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<DraftResponse>> getMyDrafts(
            @RequestHeader("X-USER") String username) {
        return ResponseEntity.ok(draftService.getMyDrafts(username));
    }

    @GetMapping("/by-request/{id}")
    public ResponseEntity<List<DraftResponse>> getDraftsByRequest(@PathVariable Long id) {
        return ResponseEntity.ok(draftService.getDraftsByRequest(id));
    }

    @PostMapping("/complete-request/{requestId}")
    public ResponseEntity<DraftResponse> completeRequestWithDraft(
            @PathVariable Long requestId,
            @RequestParam("draftId") Long draftId,
            @RequestHeader("X-USER") String username) {
        return ResponseEntity.ok(draftService.markRequestCompletedWithDraft(requestId, draftId, username));
    }

    @GetMapping("/{id}/docx")
    public ResponseEntity<byte[]> downloadDraftDocx(@PathVariable Long id) {
        byte[] bytes = draftService.getDraftDocx(id);
        String title = draftService.getDraftTitle(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + title + ".docx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(bytes);
    }
}