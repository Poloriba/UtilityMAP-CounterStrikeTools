package com.utilitymap.controller;

import com.utilitymap.dto.LineupRequest;
import com.utilitymap.dto.LineupResponse;
import com.utilitymap.entity.Side;
import com.utilitymap.entity.UtilityType;
import com.utilitymap.service.LineupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lineups")
@RequiredArgsConstructor
public class LineupController {

    private final LineupService lineupService;

    @GetMapping
    public ResponseEntity<List<LineupResponse>> getAll(
            @RequestParam(required = false) String map,
            @RequestParam(required = false) Side side,
            @RequestParam(required = false) UtilityType type,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(lineupService.findAll(map, side, type, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LineupResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(lineupService.findById(id));
    }

    @PostMapping
    public ResponseEntity<LineupResponse> create(@Valid @RequestBody LineupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lineupService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LineupResponse> update(@PathVariable UUID id, @Valid @RequestBody LineupRequest request) {
        return ResponseEntity.ok(lineupService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        lineupService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
