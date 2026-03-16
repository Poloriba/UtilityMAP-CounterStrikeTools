package com.utilitymap.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pg_exec")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exec {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "map_name", nullable = false)
    private String mapName;

    /** JSON sérialisé : positions jetons, grenades, flèches */
    @Column(name = "snapshot_json", columnDefinition = "TEXT", nullable = false)
    private String snapshotJson;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "pg_exec_lineup",
        joinColumns = @JoinColumn(name = "exec_id"),
        inverseJoinColumns = @JoinColumn(name = "lineup_id")
    )
    @Builder.Default
    private List<UtilityLineup> lineups = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
