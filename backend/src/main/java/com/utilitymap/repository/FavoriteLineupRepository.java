package com.utilitymap.repository;

import com.utilitymap.entity.FavoriteLineup;
import com.utilitymap.entity.UtilityLineup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteLineupRepository extends JpaRepository<FavoriteLineup, UUID> {

    @Query("SELECT f.lineup FROM FavoriteLineup f WHERE f.user.id = :userId")
    List<UtilityLineup> findLineupsByUserId(@Param("userId") UUID userId);

    Optional<FavoriteLineup> findByUserIdAndLineupId(UUID userId, UUID lineupId);

    boolean existsByUserIdAndLineupId(UUID userId, UUID lineupId);
}
