package com.utilitymap.repository;

import com.utilitymap.entity.Side;
import com.utilitymap.entity.UtilityLineup;
import com.utilitymap.entity.UtilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UtilityLineupRepository extends JpaRepository<UtilityLineup, UUID> {

    @Query("""
        SELECT u FROM UtilityLineup u
        WHERE (:mapName IS NULL OR LOWER(u.mapName) = LOWER(:mapName))
          AND (:side IS NULL OR u.side = :side)
          AND (:utilityType IS NULL OR u.utilityType = :utilityType)
          AND (:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.description) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    List<UtilityLineup> findByFilters(
        @Param("mapName") String mapName,
        @Param("side") Side side,
        @Param("utilityType") UtilityType utilityType,
        @Param("search") String search
    );
}
