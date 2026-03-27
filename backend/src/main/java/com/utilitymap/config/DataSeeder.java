package com.utilitymap.config;

import com.utilitymap.entity.AppUser;
import com.utilitymap.entity.Side;
import com.utilitymap.entity.UtilityLineup;
import com.utilitymap.entity.UtilityType;
import com.utilitymap.repository.AppUserRepository;
import com.utilitymap.repository.UtilityLineupRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Slf4j
@Configuration
public class DataSeeder {

    @Bean
    @Profile("!prod")
    public CommandLineRunner seedData(UtilityLineupRepository lineupRepo, AppUserRepository userRepo) {
        return args -> {
            if (lineupRepo.count() > 0) return;

            // Seed user
            AppUser user = AppUser.builder().username("player1").build();
            if (user != null) {
                userRepo.save(user);
            }

            // Seed lineups
            UtilityLineup lineup1 = UtilityLineup.builder()
                    .mapName("Mirage")
                    .side(Side.T)
                    .utilityType(UtilityType.SMOKE)
                    .name("Window smoke")
                    .description("Smoke depuis le spawn T vers window CT")
                    .throwPosition("T spawn ramp")
                    .aimPosition("Coin toit window")
                    .build();
            if (lineup1 != null) {
                lineupRepo.save(lineup1);
            }

            UtilityLineup lineup2 = UtilityLineup.builder()
                    .mapName("Mirage")
                    .side(Side.T)
                    .utilityType(UtilityType.SMOKE)
                    .name("CT smoke")
                    .description("Smoke CT depuis jungle")
                    .throwPosition("Jungle")
                    .aimPosition("Bord du toit CT")
                    .build();
            if (lineup2 != null) {
                lineupRepo.save(lineup2);
            }

            UtilityLineup lineup3 = UtilityLineup.builder()
                    .mapName("Inferno")
                    .side(Side.T)
                    .utilityType(UtilityType.MOLOTOV)
                    .name("Molotov CT Inferno")
                    .description("Molotov sur la position CT derrière le pilier")
                    .throwPosition("Top mid")
                    .aimPosition("Pilier gauche CT")
                    .build();
            if (lineup3 != null) {
                lineupRepo.save(lineup3);
            }

            UtilityLineup lineup4 = UtilityLineup.builder()
                    .mapName("Dust2")
                    .side(Side.CT)
                    .utilityType(UtilityType.FLASH)
                    .name("Flash long A - CT")
                    .description("Flash pour pop depuis CT long vers T")
                    .throwPosition("CT long corner")
                    .aimPosition("Mur long")
                    .build();
            if (lineup4 != null) {
                lineupRepo.save(lineup4);
            }

            log.info("[DataSeeder] Données de test insérées.");
        };
    }
}
