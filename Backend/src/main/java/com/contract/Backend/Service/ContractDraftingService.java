package com.contract.Backend.Service;

import com.contract.Backend.DTO.ContractResponse;
import com.contract.Backend.DTO.ContractRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ContractDraftingService {

    private static final Logger log = LoggerFactory.getLogger(ContractDraftingService.class);

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    @Autowired
    public ContractDraftingService(ChatModel chatModel, ObjectMapper objectMapper) {
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
    }

    public ContractResponse draftContract(ContractRequest request) {
        try {
            log.info("Starting contract drafting for: {}", request.getContractType());

            // Build the prompt
            String promptText = buildPrompt(request);
            log.debug("Prompt built successfully");

            // Create Ollama options with explicit configuration
//            OllamaOptions options = OllamaOptions.create()
//                    .withModel("llama2")
//                    .withTemperature(0.3)
//                    .withFormat("json");

            // Create prompt with options
            Prompt prompt = new Prompt(promptText);

            // Call Ollama model
            log.info("Calling Ollama for contract drafting...");
            ChatResponse chatResponse = chatModel.call(prompt);

            // Extract response text - compatible with different Spring AI versions
            String responseText = getResponseText(chatResponse);

            log.info("Received response from Ollama, length: {}", responseText.length());
            log.debug("Raw response: {}", responseText);

            // Parse the JSON response
            ContractResponse contractResponse = parseContractResponse(responseText, request);

            return contractResponse;

        } catch (Exception e) {
            log.error("Error drafting contract: {}", e.getMessage(), e);
            return createErrorResponse(request, e.getMessage());
        }
    }

    private String getResponseText(ChatResponse chatResponse) {
        // Try different methods for compatibility

            try {
                return chatResponse.getResult().getOutput().getText();
            } catch (Exception e2) {
                // Last resort - try to get string representation
                return chatResponse.getResult().getOutput().toString();
            }
        }


    private String buildPrompt(ContractRequest request) {
        String contractType = request.getContractType() != null ? request.getContractType() : "General Agreement";
        String partyA = request.getPartyA() != null ? request.getPartyA() : "Party A";
        String partyB = request.getPartyB() != null ? request.getPartyB() : "Party B";

        StringBuilder promptBuilder = new StringBuilder();

        promptBuilder.append("You are a professional legal contract drafting assistant.\n\n");
        promptBuilder.append("Create a ").append(contractType).append(" with these details:\n");
        promptBuilder.append("- Request: ").append(request.getPrompt()).append("\n");
        promptBuilder.append("- First Party: ").append(partyA).append("\n");
        promptBuilder.append("- Second Party: ").append(partyB).append("\n\n");

        promptBuilder.append("Respond ONLY with valid JSON in this exact format (no markdown, no explanation):\n\n");
        promptBuilder.append("{\n");
        promptBuilder.append("  \"contract_title\": \"Contract Title Here\",\n");
        promptBuilder.append("  \"contract_type\": \"").append(contractType).append("\",\n");
        promptBuilder.append("  \"parties\": {\n");
        promptBuilder.append("    \"party_a\": \"").append(partyA).append("\",\n");
        promptBuilder.append("    \"party_b\": \"").append(partyB).append("\"\n");
        promptBuilder.append("  },\n");
        promptBuilder.append("  \"effective_date\": \"2024-01-01\",\n");
        promptBuilder.append("  \"terms_and_conditions\": \"Summary of key terms\",\n");
        promptBuilder.append("  \"clauses\": [\n");
        promptBuilder.append("    {\"clause_number\": \"1\", \"title\": \"Definitions\", \"content\": \"Define key terms...\"},\n");
        promptBuilder.append("    {\"clause_number\": \"2\", \"title\": \"Scope\", \"content\": \"Agreement scope...\"},\n");
        promptBuilder.append("    {\"clause_number\": \"3\", \"title\": \"Obligations\", \"content\": \"Party obligations...\"},\n");
        promptBuilder.append("    {\"clause_number\": \"4\", \"title\": \"Term\", \"content\": \"Agreement duration...\"},\n");
        promptBuilder.append("    {\"clause_number\": \"5\", \"title\": \"Confidentiality\", \"content\": \"Confidentiality terms...\"},\n");
        promptBuilder.append("    {\"clause_number\": \"6\", \"title\": \"Termination\", \"content\": \"Termination conditions...\"},\n");
        promptBuilder.append("    {\"clause_number\": \"7\", \"title\": \"Disputes\", \"content\": \"Dispute resolution...\"},\n");
        promptBuilder.append("    {\"clause_number\": \"8\", \"title\": \"Governing Law\", \"content\": \"Applicable law...\"}\n");
        promptBuilder.append("  ],\n");
        promptBuilder.append("  \"signatures\": {\n");
        promptBuilder.append("    \"party_a_signature\": \"_________________________\",\n");
        promptBuilder.append("    \"party_b_signature\": \"_________________________\",\n");
        promptBuilder.append("    \"date\": \"_________________________\"\n");
        promptBuilder.append("  }\n");
        promptBuilder.append("}\n\n");

        promptBuilder.append("Include comprehensive legal clauses appropriate for a ").append(contractType).append(".\n");
        promptBuilder.append("Make the content professional and legally sound.\n");
        promptBuilder.append("Return ONLY the JSON object, nothing else.");

        return promptBuilder.toString();
    }

    private ContractResponse parseContractResponse(String response, ContractRequest request) {
        try {
            // Clean the response
            String cleanedResponse = cleanJsonResponse(response);
            log.debug("Cleaned JSON: {}", cleanedResponse);

            // Parse JSON
            ContractResponse contractResponse = objectMapper.readValue(cleanedResponse, ContractResponse.class);

            // Generate raw content if not present
            if (contractResponse.getRawContent() == null || contractResponse.getRawContent().isEmpty()) {
                contractResponse.setRawContent(generateRawContent(contractResponse));
            }

            // Validate and fill missing fields
            validateAndFillResponse(contractResponse, request);

            return contractResponse;

        } catch (Exception e) {
            log.error("Failed to parse JSON response: {}", e.getMessage());
            log.debug("Response was: {}", response);

            // Return fallback response with the AI's text
            return createFallbackResponse(request, response);
        }
    }

    private String cleanJsonResponse(String response) {
        String cleaned = response.trim();

        // Remove markdown code blocks
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();

        // Extract JSON object
        int jsonStart = cleaned.indexOf("{");
        int jsonEnd = cleaned.lastIndexOf("}");

        if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }

        return cleaned;
    }

    private void validateAndFillResponse(ContractResponse response, ContractRequest request) {
        if (response.getContractTitle() == null || response.getContractTitle().isEmpty()) {
            response.setContractTitle(request.getContractType() + " Agreement");
        }

        if (response.getContractType() == null || response.getContractType().isEmpty()) {
            response.setContractType(request.getContractType());
        }

        if (response.getParties() == null) {
            ContractResponse.Parties parties = new ContractResponse.Parties();
            parties.setPartyA(request.getPartyA());
            parties.setPartyB(request.getPartyB());
            response.setParties(parties);
        }

        if (response.getEffectiveDate() == null) {
            response.setEffectiveDate(LocalDate.now().toString());
        }

        if (response.getClauses() == null || response.getClauses().isEmpty()) {
            response.setClauses(createDefaultClauses(request.getContractType()));
        }

        if (response.getSignatures() == null) {
            ContractResponse.Signatures signatures = new ContractResponse.Signatures();
            signatures.setPartyASignature("_________________________");
            signatures.setPartyBSignature("_________________________");
            signatures.setDate("_________________________");
            response.setSignatures(signatures);
        }
    }

    private ContractResponse createFallbackResponse(ContractRequest request, String aiResponse) {
        log.info("Creating fallback response with AI content");

        ContractResponse response = new ContractResponse();
        response.setContractTitle(request.getContractType() + " Agreement");
        response.setContractType(request.getContractType());

        ContractResponse.Parties parties = new ContractResponse.Parties();
        parties.setPartyA(request.getPartyA());
        parties.setPartyB(request.getPartyB());
        response.setParties(parties);

        response.setEffectiveDate(LocalDate.now().toString());
        response.setTermsAndConditions("This agreement is drafted based on the provided requirements.");
        response.setClauses(createDefaultClauses(request.getContractType()));

        ContractResponse.Signatures signatures = new ContractResponse.Signatures();
        signatures.setPartyASignature("_________________________");
        signatures.setPartyBSignature("_________________________");
        signatures.setDate("_________________________");
        response.setSignatures(signatures);

        response.setRawContent(aiResponse);

        return response;
    }

    private ContractResponse createErrorResponse(ContractRequest request, String errorMessage) {
        log.error("Creating error response");

        ContractResponse response = new ContractResponse();
        response.setContractTitle("Error: Contract Could Not Be Generated");
        response.setContractType(request.getContractType());

        ContractResponse.Parties parties = new ContractResponse.Parties();
        parties.setPartyA(request.getPartyA());
        parties.setPartyB(request.getPartyB());
        response.setParties(parties);

        response.setEffectiveDate(LocalDate.now().toString());
        response.setTermsAndConditions("An error occurred during contract generation.");
        response.setClauses(createDefaultClauses(request.getContractType()));

        ContractResponse.Signatures signatures = new ContractResponse.Signatures();
        signatures.setPartyASignature("_________________________");
        signatures.setPartyBSignature("_________________________");
        signatures.setDate("_________________________");
        response.setSignatures(signatures);

        response.setRawContent("Error: " + errorMessage);

        return response;
    }

    private List<ContractResponse.Clause> createDefaultClauses(String contractType) {
        List<ContractResponse.Clause> clauses = new ArrayList<>();

        ContractResponse.Clause clause1 = new ContractResponse.Clause();
        clause1.setClauseNumber("1");
        clause1.setTitle("Definitions");
        clause1.setContent("In this Agreement, the following terms shall have the meanings set forth below: 'Agreement' refers to this contract and all attachments hereto; 'Effective Date' means the date first written above; 'Party' or 'Parties' refers to the parties to this Agreement.");
        clauses.add(clause1);

        ContractResponse.Clause clause2 = new ContractResponse.Clause();
        clause2.setClauseNumber("2");
        clause2.setTitle("Purpose and Scope");
        clause2.setContent("This Agreement sets forth the terms and conditions under which the Parties agree to conduct their business relationship. The scope of this Agreement encompasses all activities, obligations, and rights detailed herein.");
        clauses.add(clause2);

        ContractResponse.Clause clause3 = new ContractResponse.Clause();
        clause3.setClauseNumber("3");
        clause3.setTitle("Obligations");
        clause3.setContent("Each Party agrees to fulfill all obligations set forth in this Agreement in a timely and professional manner. Both Parties shall act in good faith and shall cooperate with each other to achieve the purposes of this Agreement.");
        clauses.add(clause3);

        ContractResponse.Clause clause4 = new ContractResponse.Clause();
        clause4.setClauseNumber("4");
        clause4.setTitle("Term and Termination");
        clause4.setContent("This Agreement shall commence on the Effective Date and continue until terminated by either Party upon thirty (30) days written notice. Either Party may terminate immediately for material breach by the other Party.");
        clauses.add(clause4);

        ContractResponse.Clause clause5 = new ContractResponse.Clause();
        clause5.setClauseNumber("5");
        clause5.setTitle("Confidentiality");
        clause5.setContent("Each Party acknowledges that it may have access to confidential information of the other Party. Both Parties agree to maintain the confidentiality of such information and not to disclose it to third parties without prior written consent.");
        clauses.add(clause5);

        ContractResponse.Clause clause6 = new ContractResponse.Clause();
        clause6.setClauseNumber("6");
        clause6.setTitle("Dispute Resolution");
        clause6.setContent("Any disputes arising out of or in connection with this Agreement shall first be attempted to be resolved through good faith negotiations. If negotiations fail, disputes shall be resolved through binding arbitration in accordance with applicable laws.");
        clauses.add(clause6);

        ContractResponse.Clause clause7 = new ContractResponse.Clause();
        clause7.setClauseNumber("7");
        clause7.setTitle("Governing Law");
        clause7.setContent("This Agreement shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.");
        clauses.add(clause7);

        ContractResponse.Clause clause8 = new ContractResponse.Clause();
        clause8.setClauseNumber("8");
        clause8.setTitle("Entire Agreement");
        clause8.setContent("This Agreement constitutes the entire agreement between the Parties and supersedes all prior understandings and agreements, whether written or oral, relating to the subject matter hereof.");
        clauses.add(clause8);

        return clauses;
    }

    private String generateRawContent(ContractResponse response) {
        StringBuilder content = new StringBuilder();

        content.append("═══════════════════════════════════════════════════════════════\n");
        content.append("         ").append(response.getContractTitle().toUpperCase()).append("\n");
        content.append("═══════════════════════════════════════════════════════════════\n\n");

        content.append("Contract Type: ").append(response.getContractType()).append("\n");
        content.append("Effective Date: ").append(response.getEffectiveDate()).append("\n\n");

        content.append("PARTIES TO THIS AGREEMENT:\n");
        content.append("───────────────────────────────────────────────────────────────\n");
        if (response.getParties() != null) {
            content.append("First Party (Party A):  ").append(response.getParties().getPartyA()).append("\n");
            content.append("Second Party (Party B): ").append(response.getParties().getPartyB()).append("\n");
        }
        content.append("\n");

        if (response.getTermsAndConditions() != null && !response.getTermsAndConditions().isEmpty()) {
            content.append("TERMS AND CONDITIONS:\n");
            content.append("───────────────────────────────────────────────────────────────\n");
            content.append(response.getTermsAndConditions()).append("\n\n");
        }

        content.append("\nCONTRACT CLAUSES:\n");
        content.append("═══════════════════════════════════════════════════════════════\n\n");

        if (response.getClauses() != null) {
            for (ContractResponse.Clause clause : response.getClauses()) {
                content.append("Clause ").append(clause.getClauseNumber()).append(": ");
                content.append(clause.getTitle().toUpperCase()).append("\n");
                content.append("───────────────────────────────────────────────────────────────\n");
                content.append(clause.getContent()).append("\n\n");
            }
        }

        content.append("\n═══════════════════════════════════════════════════════════════\n");
        content.append("                         SIGNATURES\n");
        content.append("═══════════════════════════════════════════════════════════════\n\n");

        if (response.getSignatures() != null) {
            if (response.getParties() != null) {
                content.append("Party A (").append(response.getParties().getPartyA()).append("):\n");
            } else {
                content.append("Party A:\n");
            }
            content.append("Signature: ").append(response.getSignatures().getPartyASignature()).append("\n\n");

            if (response.getParties() != null) {
                content.append("Party B (").append(response.getParties().getPartyB()).append("):\n");
            } else {
                content.append("Party B:\n");
            }
            content.append("Signature: ").append(response.getSignatures().getPartyBSignature()).append("\n\n");
            content.append("Date: ").append(response.getSignatures().getDate()).append("\n");
        }

        return content.toString();
    }
}