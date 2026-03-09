package com.utilitymap.service;

import com.utilitymap.dto.LineupRequest;
import com.utilitymap.dto.LineupResponse;
import com.utilitymap.entity.Side;
import com.utilitymap.entity.UtilityLineup;
import com.utilitymap.entity.UtilityType;
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
public class LineupService {

    private final UtilityLineupRepository lineupRepository;
    private final FavoriteLineupRepository favoriteRepository;

    @Transactional(readOnly = true)
    public List<LineupResponse> findAll(String mapName, Side side, UtilityType utilityType, String search) {
        return lineupRepository.findByFilters(mapName, side, utilityType, search)
                .stream()
                .map(LineupResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public LineupResponse findById(UUID id) {
        UtilityLineup lineup = lineupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lineup introuvable : " + id));
        return LineupResponse.from(lineup);
    }

    public LineupResponse create(LineupRequest request) {
        UtilityLineup lineup = UtilityLineup.builder()
                .mapName(request.getMapName())
                .side(request.getSide())
                .utilityType(request.getUtilityType())
                .name(request.getName())
                .description(request.getDescription())
                .throwPosition(request.getThrowPosition())
                .aimPosition(request.getAimPosition())
                .imageUrl(request.getImageUrl())
                .videoUrl(request.getVideoUrl())
                .build();
        return LineupResponse.from(lineupRepository.save(lineup));
    }

    public LineupResponse update(UUID id, LineupRequest request) {
        UtilityLineup lineup = lineupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lineup introuvable : " + id));

        lineup.setMapName(request.getMapName());
        lineup.setSide(request.getSide());
        lineup.setUtilityType(request.getUtilityType());
        lineup.setName(request.getName());
        lineup.setDescription(request.getDescription());
        lineup.setThrowPosition(request.getThrowPosition());
        lineup.setAimPosition(request.getAimPosition());
        lineup.setImageUrl(request.getImageUrl());
        lineup.setVideoUrl(request.getVideoUrl());

        return LineupResponse.from(lineupRepository.save(lineup));
    }

    public void delete(UUID id) {
        if (!lineupRepository.existsById(id)) {
            throw new EntityNotFoundException("Lineup introuvable : " + id);
        }
        lineupRepository.deleteById(id);
    }
}
