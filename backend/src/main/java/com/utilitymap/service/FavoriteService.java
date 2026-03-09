package com.utilitymap.service;

import com.utilitymap.dto.LineupResponse;
import com.utilitymap.entity.AppUser;
import com.utilitymap.entity.FavoriteLineup;
import com.utilitymap.entity.UtilityLineup;
import com.utilitymap.repository.AppUserRepository;
import com.utilitymap.repository.FavoriteLineupRepository;
import com.utilitymap.repository.UtilityLineupRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class FavoriteService {

    private final FavoriteLineupRepository favoriteRepository;
    private final AppUserRepository userRepository;
    private final UtilityLineupRepository lineupRepository;

    public void addFavorite(UUID userId, UUID lineupId) {
        if (favoriteRepository.existsByUserIdAndLineupId(userId, lineupId)) {
            return; // déjà en favori, idempotent
        }
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + userId));
        UtilityLineup lineup = lineupRepository.findById(lineupId)
                .orElseThrow(() -> new EntityNotFoundException("Lineup introuvable : " + lineupId));

        favoriteRepository.save(FavoriteLineup.builder()
                .user(user)
                .lineup(lineup)
                .build());
    }

    public void removeFavorite(UUID userId, UUID lineupId) {
        favoriteRepository.findByUserIdAndLineupId(userId, lineupId)
                .ifPresent(favoriteRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<LineupResponse> getFavorites(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("Utilisateur introuvable : " + userId);
        }
        return favoriteRepository.findLineupsByUserId(userId)
                .stream()
                .map(l -> LineupResponse.from(l, true))
                .toList();
    }
}
