package com.utilitymap.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ExecRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String mapName;

    @NotBlank
    private String snapshotJson;

    private List<UUID> lineupIds;
}
