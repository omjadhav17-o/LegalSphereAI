package com.contract.Backend.Repository;
import com.contract.Backend.model.ContractDraft;
import com.contract.Backend.model.ContractRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractDraftRepository extends JpaRepository<ContractDraft, Long> {
    List<ContractDraft> findByContractRequest(ContractRequest request);
    List<ContractDraft> findByContractRequestOrderByVersionDesc(ContractRequest request);
}
