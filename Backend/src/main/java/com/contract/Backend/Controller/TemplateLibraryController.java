package com.contract.Backend.Controller;

import com.contract.Backend.DTO.SaveTemplateRequest;
import com.contract.Backend.DTO.TemplateResponse;
import com.contract.Backend.Service.TemplateLibraryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
@Validated
@Slf4j
public class TemplateLibraryController {

    private final TemplateLibraryService templateService;

    /**
     * Save a new contract template to the library
     */
    @PostMapping
    public ResponseEntity<TemplateResponse> saveTemplate(
            @Valid @RequestBody SaveTemplateRequest request,
            @RequestHeader("X-User-Id") Long userId) {

        log.info("Saving template for user: {}", userId);
        TemplateResponse response = templateService.saveTemplate(request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all active templates (sorted by usage)
     */
    @GetMapping
    public ResponseEntity<List<TemplateResponse>> getAllTemplates() {
        List<TemplateResponse> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    /**
     * Get a specific template by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TemplateResponse> getTemplate(@PathVariable Long id) {
        TemplateResponse template = templateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    /**
     * Update an existing template
     */
    @PutMapping("/{id}")
    public ResponseEntity<TemplateResponse> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody SaveTemplateRequest request) {

        log.info("Updating template: {}", id);
        TemplateResponse response = templateService.updateTemplate(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Soft delete a template
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        log.info("Deleting template: {}", id);
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Increment template usage count (when used to generate a contract)
     */
    @PostMapping("/{id}/use")
    public ResponseEntity<Void> incrementUsage(@PathVariable Long id) {
        templateService.incrementUsage(id);
        return ResponseEntity.ok().build();
    }
}
