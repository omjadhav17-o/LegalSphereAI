package com.contract.Backend.Controller;

import com.contract.Backend.DTO.SaveTemplateRequest;
import com.contract.Backend.DTO.TemplateResponse;
import com.contract.Backend.Service.TemplateLibraryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

    @PostMapping
    public ResponseEntity<TemplateResponse> saveTemplate(
            @Valid @RequestBody SaveTemplateRequest request,
            @RequestHeader("X-USER") String username) {
        TemplateResponse response = templateService.saveTemplate(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TemplateResponse>> getAllTemplates() {
        List<TemplateResponse> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemplateResponse> getTemplate(@PathVariable Long id) {
        TemplateResponse template = templateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateResponse> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody SaveTemplateRequest request) {

        TemplateResponse response = templateService.updateTemplate(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/use")
    public ResponseEntity<Void> incrementUsage(@PathVariable Long id) {
        templateService.incrementUsage(id);
        return ResponseEntity.ok().build();
    }
}