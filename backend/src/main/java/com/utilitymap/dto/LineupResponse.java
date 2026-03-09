package com.utilitymap.dto;

import com.utilitymap.entity.Side;
import com.utilitymap.entity.UtilityLineup;
import com.utilitymap.entity.UtilityType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LineupResponse {

    private UUID id;
    private String mapName;
    private Side side;
    private UtilityType utilityType;
    private String name;
    private String description;
    private String throwPosition;
    private String aimPosition;
    private String imageUrl;
    private String videoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean favorite;

    public static LineupResponse from(UtilityLineup lineup) {
        LineupResponse dto = new LineupResponse();
        dto.setId(lineup.getId());
        dto.setMapName(lineup.getMapName());
        dto.setSide(lineup.getSide());
        dto.setUtilityType(lineup.getUtilityType());
        dto.setName(lineup.getName());
        dto.setDescription(lineup.getDescription());
        dto.setThrowPosition(lineup.getThrowPosition());
        dto.setAimPosition(lineup.getAimPosition());
        dto.setImageUrl(lineup.getImageUrl());
        dto.setVideoUrl(lineup.getVideoUrl());
        dto.setCreatedAt(lineup.getCreatedAt());
        dto.setUpdatedAt(lineup.getUpdatedAt());
        return dto;
    }

    public static LineupResponse from(UtilityLineup lineup, boolean favorite) {
        LineupResponse dto = from(lineup);
        dto.setFavorite(favorite);
        return dto;
    }
}
