package com.utilitymap.repository;

import com.utilitymap.entity.Exec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExecRepository extends JpaRepository<Exec, UUID> {

    List<Exec> findByMapNameIgnoreCase(String mapName);
}
