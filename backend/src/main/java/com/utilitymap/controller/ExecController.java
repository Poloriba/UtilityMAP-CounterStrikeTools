package com.utilitymap.controller;

import com.utilitymap.dto.ExecRequest;
import com.utilitymap.dto.ExecResponse;
import com.utilitymap.service.ExecService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/execs")
@RequiredArgsConstructor
public class ExecController {

    private final ExecService execService;

    @GetMapping
    public ResponseEntity<List<ExecResponse>> getAll(
            @RequestParam(required = false) String map
    ) {
        return ResponseEntity.ok(execService.findAll(map));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExecResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(execService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ExecResponse> create(@Valid @RequestBody ExecRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(execService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExecResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody ExecRequest request
    ) {
        return ResponseEntity.ok(execService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        execService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/lineups/{lineupId}")
    public ResponseEntity<ExecResponse> addLineup(
            @PathVariable UUID id,
            @PathVariable UUID lineupId
    ) {
        return ResponseEntity.ok(execService.addLineup(id, lineupId));
    }

    @DeleteMapping("/{id}/lineups/{lineupId}")
    public ResponseEntity<ExecResponse> removeLineup(
            @PathVariable UUID id,
            @PathVariable UUID lineupId
    ) {
        return ResponseEntity.ok(execService.removeLineup(id, lineupId));
    }
}
