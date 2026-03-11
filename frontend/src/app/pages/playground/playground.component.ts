import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CS2_MAPS, GameMap } from '../../models/map.model';
import { LineupService } from '../../services/lineup.service';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {
  maps = CS2_MAPS;
  selectedMap: GameMap | null = null;
  lineupCount = 0;
  imageError = false;

  constructor(private router: Router, private lineupService: LineupService) {}

  ngOnInit(): void {
    // Sélectionner Mirage par défaut
    this.selectMap(this.maps[0]);
  }

  selectMap(map: GameMap): void {
    this.selectedMap = map;
    this.imageError = false;
    this.lineupCount = 0;
    this.lineupService.getAll({ map: map.name }).subscribe({
      next: lineups => this.lineupCount = lineups.length
    });
  }

  onImageError(): void {
    this.imageError = true;
  }

  goToLineups(): void {
    if (this.selectedMap) {
      this.router.navigate(['/lineups'], {
        queryParams: { map: this.selectedMap.name }
      });
    }
  }
}
