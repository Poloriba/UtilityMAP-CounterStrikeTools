package com.utilitymap.service;

import com.utilitymap.dto.ExecRequest;
import com.utilitymap.dto.ExecResponse;
import com.utilitymap.entity.Exec;
import com.utilitymap.entity.UtilityLineup;
import com.utilitymap.repository.ExecRepository;
import com.utilitymap.repository.UtilityLineupRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@SuppressWarnings("null")
public class ExecService {

    private final ExecRepository execRepository;
    private final UtilityLineupRepository lineupRepository;

    @Transactional(readOnly = true)
    public List<ExecResponse> findAll(String mapName) {
        List<Exec> execs = (mapName != null && !mapName.isBlank())
                ? execRepository.findByMapNameIgnoreCase(mapName)
                : execRepository.findAll();
        return execs.stream().map(ExecResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ExecResponse findById(UUID id) {
        return ExecResponse.from(getExec(id));
    }

    public ExecResponse create(ExecRequest request) {
        List<UtilityLineup> lineups = resolveLineups(request.getLineupIds());
        Exec exec = Exec.builder()
                .name(request.getName())
                .mapName(request.getMapName())
                .snapshotJson(request.getSnapshotJson())
                .lineups(lineups)
                .build();
        return ExecResponse.from(execRepository.save(exec));
    }

    public ExecResponse update(UUID id, ExecRequest request) {
        Exec exec = getExec(id);
        exec.setName(request.getName());
        exec.setMapName(request.getMapName());
        exec.setSnapshotJson(request.getSnapshotJson());
        exec.setLineups(resolveLineups(request.getLineupIds()));
        Exec savedExec = execRepository.save(exec);
        return ExecResponse.from(savedExec);
    }

    public void delete(UUID id) {
        if (!execRepository.existsById(id)) {
            throw new EntityNotFoundException("Exec introuvable : " + id);
        }
        execRepository.deleteById(id);
    }

    public ExecResponse addLineup(UUID execId, UUID lineupId) {
        Exec exec = getExec(execId);
        UtilityLineup lineup = lineupRepository.findById(lineupId)
                .orElseThrow(() -> new EntityNotFoundException("Lineup introuvable : " + lineupId));
        boolean alreadyLinked = exec.getLineups().stream().anyMatch(l -> l.getId().equals(lineupId));
        if (!alreadyLinked) {
            exec.getLineups().add(lineup);
        }
        return ExecResponse.from(execRepository.save(exec));
    }

    public ExecResponse removeLineup(UUID execId, UUID lineupId) {
        Exec exec = getExec(execId);
        exec.getLineups().removeIf(l -> l.getId().equals(lineupId));
        return ExecResponse.from(execRepository.save(exec));
    }

    // --- helpers ---

    private Exec getExec(UUID id) {
        return execRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Exec introuvable : " + id));
    }

    private List<UtilityLineup> resolveLineups(List<UUID> lineupIds) {
        if (lineupIds == null || lineupIds.isEmpty()) return new ArrayList<>();
        return lineupIds.stream()
                .map(lid -> lineupRepository.findById(lid)
                        .orElseThrow(() -> new EntityNotFoundException("Lineup introuvable : " + lid)))
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    }
}
