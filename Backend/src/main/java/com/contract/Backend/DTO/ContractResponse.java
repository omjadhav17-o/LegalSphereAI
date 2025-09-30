package com.contract.Backend.DTO;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContractResponse {
    @JsonProperty("contract_title")
    private String contractTitle;

    @JsonProperty("contract_type")
    private String contractType;

    @JsonProperty("parties")
    private Parties parties;

    @JsonProperty("effective_date")
    private String effectiveDate;

    @JsonProperty("terms_and_conditions")
    private String termsAndConditions;

    @JsonProperty("clauses")
    private java.util.List<Clause> clauses;

    @JsonProperty("signatures")
    private Signatures signatures;

    @JsonProperty("raw_content")
    private String rawContent;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Parties {
        @JsonProperty("party_a")
        private String partyA;

        @JsonProperty("party_b")
        private String partyB;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Clause {
        @JsonProperty("clause_number")
        private String clauseNumber;

        @JsonProperty("title")
        private String title;

        @JsonProperty("content")
        private String content;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Signatures {
        @JsonProperty("party_a_signature")
        private String partyASignature;

        @JsonProperty("party_b_signature")
        private String partyBSignature;

        @JsonProperty("date")
        private String date;
    }
}