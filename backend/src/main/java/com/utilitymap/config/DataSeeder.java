package com.utilitymap.config;

import com.utilitymap.entity.AppUser;
import com.utilitymap.entity.Side;
import com.utilitymap.entity.UtilityLineup;
import com.utilitymap.entity.UtilityType;
import com.utilitymap.repository.AppUserRepository;
import com.utilitymap.repository.UtilityLineupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    @Bean
    @Profile("!prod")
    public CommandLineRunner seedData(UtilityLineupRepository lineupRepo, AppUserRepository userRepo) {
        return args -> {
            if (lineupRepo.count() > 0) return;

            // Seed user
            AppUser user = userRepo.save(AppUser.builder().username("player1").build());

            // Seed lineups
            lineupRepo.save(UtilityLineup.builder()
                    .mapName("Mirage")
                    .side(Side.T)
                    .utilityType(UtilityType.SMOKE)
                    .name("Window smoke")
                    .description("Smoke depuis le spawn T vers window CT")
                    .throwPosition("T spawn ramp")
                    .aimPosition("Coin toit window")
                    .build());

            lineupRepo.save(UtilityLineup.builder()
                    .mapName("Mirage")
                    .side(Side.T)
                    .utilityType(UtilityType.SMOKE)
                    .name("CT smoke")
                    .description("Smoke CT depuis jungle")
                    .throwPosition("Jungle")
                    .aimPosition("Bord du toit CT")
                    .build());

            lineupRepo.save(UtilityLineup.builder()
                    .mapName("Inferno")
                    .side(Side.T)
                    .utilityType(UtilityType.MOLOTOV)
                    .name("Molotov CT Inferno")
                    .description("Molotov sur la position CT derrière le pilier")
                    .throwPosition("Top mid")
                    .aimPosition("Pilier gauche CT")
                    .build());

            lineupRepo.save(UtilityLineup.builder()
                    .mapName("Dust2")
                    .side(Side.CT)
                    .utilityType(UtilityType.FLASH)
                    .name("Flash long A - CT")
                    .description("Flash pour pop depuis CT long vers T")
                    .throwPosition("CT long corner")
                    .aimPosition("Mur long")
                    .build());

            System.out.println("[DataSeeder] Données de test insérées.");
        };
    }
}
