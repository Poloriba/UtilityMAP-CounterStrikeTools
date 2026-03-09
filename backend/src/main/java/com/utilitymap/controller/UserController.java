package com.utilitymap.controller;

import com.utilitymap.dto.LineupResponse;
import com.utilitymap.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final FavoriteService favoriteService;

    @PostMapping("/{userId}/favorites/{lineupId}")
    public ResponseEntity<Void> addFavorite(@PathVariable UUID userId, @PathVariable UUID lineupId) {
        favoriteService.addFavorite(userId, lineupId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/favorites/{lineupId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable UUID userId, @PathVariable UUID lineupId) {
        favoriteService.removeFavorite(userId, lineupId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/favorites")
    public ResponseEntity<List<LineupResponse>> getFavorites(@PathVariable UUID userId) {
        return ResponseEntity.ok(favoriteService.getFavorites(userId));
    }
}
