package com.utilitymap.dto;

import com.utilitymap.entity.Exec;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ExecResponse {

    private UUID id;
    private String name;
    private String mapName;
    private String snapshotJson;
    private List<LineupResponse> lineups;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ExecResponse from(Exec exec) {
        ExecResponse dto = new ExecResponse();
        dto.setId(exec.getId());
        dto.setName(exec.getName());
        dto.setMapName(exec.getMapName());
        dto.setSnapshotJson(exec.getSnapshotJson());
        dto.setLineups(exec.getLineups().stream().map(LineupResponse::from).toList());
        dto.setCreatedAt(exec.getCreatedAt());
        dto.setUpdatedAt(exec.getUpdatedAt());
        return dto;
    }
}
