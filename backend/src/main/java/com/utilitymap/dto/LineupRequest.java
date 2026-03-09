package com.utilitymap.dto;

import com.utilitymap.entity.Side;
import com.utilitymap.entity.UtilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LineupRequest {

    @NotBlank(message = "Le nom de la map est obligatoire")
    private String mapName;

    @NotNull(message = "Le side est obligatoire")
    private Side side;

    @NotNull(message = "Le type d'utilitaire est obligatoire")
    private UtilityType utilityType;

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;
    private String throwPosition;
    private String aimPosition;
    private String imageUrl;
    private String videoUrl;
}
