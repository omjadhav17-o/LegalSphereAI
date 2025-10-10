package com.contract.Backend.Repository;
import com.contract.Backend.model.ContractRequest;
import com.contract.Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRequestRepository extends JpaRepository<ContractRequest, Long> {
    List<ContractRequest> findByRequestedBy(User user);
    List<ContractRequest> findByAssignedTo(User user);
    List<ContractRequest> findByStatus(ContractRequest.RequestStatus status);
    List<ContractRequest> findByAssignedToIsNull();
}
