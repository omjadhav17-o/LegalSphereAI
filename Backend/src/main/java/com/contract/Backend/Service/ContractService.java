package com.contract.Backend.Service;

import com.contract.Backend.DTO.ContractDraftRequest;
import com.contract.Backend.DTO.ContractDraftResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Service for generating contract drafts using Ollama AI integration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContractService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    /**
     * Generate a contract draft based on the provided request
     */
    public ContractDraftResponse generateContractDraft(ContractDraftRequest request) {
        try {
            log.info("Generating contract draft for type: {}", request.getContractType());
            
            // Create the AI prompt for contract generation
            String aiPrompt = buildContractPrompt(request);
            
            // Call Ollama AI to generate the contract with error handling
            String aiResponse;
            try {
                aiResponse = chatClient.prompt()
                        .user(aiPrompt)
                        .call()
                        .content();
                
                log.debug("AI Response received successfully");
                log.trace("AI Response content: {}", aiResponse);
                
            } catch (Exception aiException) {
                log.error("Error calling Ollama AI service", aiException);
                // Fallback to a basic contract template if AI fails
                aiResponse = generateFallbackContract(request);
                log.info("Using fallback contract template due to AI service error");
            }
            
            // Parse and structure the AI response
            return parseAiResponse(aiResponse, request);
            
        } catch (Exception e) {
            log.error("Error generating contract draft", e);
            throw new RuntimeException("Failed to generate contract draft: " + e.getMessage(), e);
        }
    }

    /**
     * Build a comprehensive prompt for AI contract generation
     */
    private String buildContractPrompt(ContractDraftRequest request) {
        return String.format("""
            Generate a professional %s contract between the following parties:
            
            Party A: %s
            Party B: %s
            
            Requirements: %s
            
            Please structure the contract with the following sections:
            1. Title and Preamble
            2. Definitions (if applicable)
            3. Main Terms and Conditions
            4. Obligations of each party
            5. Confidentiality clauses (for NDA)
            6. Term and Termination
            7. Governing Law and Jurisdiction
            8. Signatures
            
            Also provide a risk analysis identifying potential legal risks and recommendations.
            
            Format the response as a structured document with clear sections.
            Include specific dates, terms, and professional legal language appropriate for a %s.
            
            Make sure the contract is legally sound and includes standard protective clauses.
            """, 
            request.getContractType(),
            request.getPartyA(),
            request.getPartyB(),
            request.getPrompt(),
            request.getContractType()
        );
    }

    /**
     * Parse AI response and convert to structured ContractDraftResponse
     */
    private ContractDraftResponse parseAiResponse(String aiResponse, ContractDraftRequest request) {
        try {
            // Extract contract sections from AI response
            List<ContractDraftResponse.ContractSection> sections = extractSections(aiResponse);
            
            // Generate risk analysis
            ContractDraftResponse.RiskAnalysis riskAnalysis = generateRiskAnalysis(aiResponse, request.getContractType());
            
            return ContractDraftResponse.builder()
                    .contractTitle(generateContractTitle(request))
                    .contractType(request.getContractType())
                    .partyA(request.getPartyA())
                    .partyB(request.getPartyB())
                    .generatedAt(LocalDateTime.now())
                    .preamble(extractPreamble(aiResponse))
                    .sections(sections)
                    .conclusion(extractConclusion(aiResponse))
                    .jurisdiction("United States")
                    .governingLaw("State Law")
                    .effectiveDate(LocalDateTime.now().toLocalDate().toString())
                    .expirationDate(LocalDateTime.now().plusYears(1).toLocalDate().toString())
                    .riskAnalysis(riskAnalysis)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error parsing AI response", e);
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }
    }

    /**
     * Extract contract sections from AI response
     */
    private List<ContractDraftResponse.ContractSection> extractSections(String aiResponse) {
        List<ContractDraftResponse.ContractSection> sections = new ArrayList<>();
        
        // Split response into sections based on numbered headings
        String[] lines = aiResponse.split("\n");
        StringBuilder currentSection = new StringBuilder();
        String currentTitle = "";
        int sectionNumber = 1;
        
        for (String line : lines) {
            if (line.matches("^\\d+\\..*") || line.matches("^[A-Z][A-Z ]+:.*")) {
                // Save previous section if exists
                if (!currentTitle.isEmpty() && currentSection.length() > 0) {
                    sections.add(ContractDraftResponse.ContractSection.builder()
                            .title(currentTitle)
                            .content(currentSection.toString().trim())
                            .sectionNumber(sectionNumber++)
                            .subsections(new ArrayList<>())
                            .build());
                }
                
                // Start new section
                currentTitle = line.replaceFirst("^\\d+\\.", "").trim();
                currentSection = new StringBuilder();
            } else if (!line.trim().isEmpty()) {
                currentSection.append(line).append("\n");
            }
        }
        
        // Add last section
        if (!currentTitle.isEmpty() && currentSection.length() > 0) {
            sections.add(ContractDraftResponse.ContractSection.builder()
                    .title(currentTitle)
                    .content(currentSection.toString().trim())
                    .sectionNumber(sectionNumber)
                    .subsections(new ArrayList<>())
                    .build());
        }
        
        return sections;
    }

    /**
     * Generate risk analysis for the contract
     */
    private ContractDraftResponse.RiskAnalysis generateRiskAnalysis(String contractContent, String contractType) {
        List<ContractDraftResponse.RiskAnalysis.RiskItem> risks = new ArrayList<>();
        
        // Add common risks based on contract type
        if ("NDA".equals(contractType)) {
            risks.add(ContractDraftResponse.RiskAnalysis.RiskItem.builder()
                    .type("medium")
                    .title("Broad Definition of Confidential Information")
                    .description("The definition of confidential information may be too broad, potentially restricting normal business operations.")
                    .location("Definitions Section")
                    .recommendation("Consider narrowing the scope of confidential information to specific categories.")
                    .build());
                    
            risks.add(ContractDraftResponse.RiskAnalysis.RiskItem.builder()
                    .type("low")
                    .title("Term Duration")
                    .description("The confidentiality obligations may extend beyond the business relationship.")
                    .location("Term Section")
                    .recommendation("Ensure the term is reasonable for the type of information being protected.")
                    .build());
        }
        
        // Add general contract risks
        risks.add(ContractDraftResponse.RiskAnalysis.RiskItem.builder()
                .type("medium")
                .title("Jurisdiction and Governing Law")
                .description("Contract specifies governing law and jurisdiction which may impact enforceability.")
                .location("Governing Law Section")
                .recommendation("Ensure the chosen jurisdiction is favorable and accessible to both parties.")
                .build());
        
        return ContractDraftResponse.RiskAnalysis.builder()
                .overallRisk("medium")
                .risks(risks)
                .summary("The contract contains standard terms with moderate risk levels. Review recommended sections before execution.")
                .build();
    }

    /**
     * Extract preamble from AI response
     */
    private String extractPreamble(String aiResponse) {
        String[] lines = aiResponse.split("\n");
        StringBuilder preamble = new StringBuilder();
        
        for (String line : lines) {
            if (line.matches("^\\d+\\..*") || line.matches("^[A-Z][A-Z ]+:.*")) {
                break; // Stop at first numbered section
            }
            if (!line.trim().isEmpty()) {
                preamble.append(line).append("\n");
            }
        }
        
        return preamble.toString().trim();
    }

    /**
     * Extract conclusion from AI response
     */
    private String extractConclusion(String aiResponse) {
        // Look for signature section or conclusion
        if (aiResponse.toLowerCase().contains("signature")) {
            int signatureIndex = aiResponse.toLowerCase().lastIndexOf("signature");
            return aiResponse.substring(signatureIndex).trim();
        }
        
        return "IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.\n\n" +
               "Party A: _________________________\n" +
               "Party B: _________________________";
    }

    /**
     * Generate fallback contract when AI service is unavailable
     */
    private String generateFallbackContract(ContractDraftRequest request) {
        return String.format("""
            %s AGREEMENT
            
            This %s Agreement ("Agreement") is entered into on [DATE] between:
            
            Party A: %s ("Disclosing Party")
            Party B: %s ("Receiving Party")
            
            1. CONFIDENTIAL INFORMATION
            The parties acknowledge that confidential information may be disclosed during their business relationship.
            %s
            
            2. OBLIGATIONS
            The Receiving Party agrees to:
            - Maintain confidentiality of all disclosed information
            - Use the information solely for the intended purpose
            - Not disclose information to third parties without written consent
            
            3. TERM
            This Agreement shall remain in effect for a period of two (2) years from the date of execution.
            
            4. RETURN OF MATERIALS
            Upon termination, all confidential materials shall be returned or destroyed.
            
            5. GOVERNING LAW
            This Agreement shall be governed by the laws of the applicable jurisdiction.
            
            IN WITNESS WHEREOF, the parties have executed this Agreement.
            
            Party A: _________________________
            %s
            
            Party B: _________________________
            %s
            """, 
            request.getContractType().toUpperCase(),
            request.getContractType(),
            request.getPartyA(),
            request.getPartyB(),
            request.getPrompt(),
            request.getPartyA(),
            request.getPartyB()
        );
    }

    /**
     * Generate contract title based on request
     */
    private String generateContractTitle(ContractDraftRequest request) {
        return String.format("%s Agreement between %s and %s", 
                request.getContractType(), 
                request.getPartyA(), 
                request.getPartyB());
    }
}