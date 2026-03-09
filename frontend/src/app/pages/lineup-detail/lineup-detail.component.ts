import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Lineup } from '../../models/lineup.model';
import { LineupService } from '../../services/lineup.service';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-lineup-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatDividerModule, MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './lineup-detail.component.html',
  styleUrls: ['./lineup-detail.component.scss']
})
export class LineupDetailComponent implements OnInit {
  lineup?: Lineup;
  loading = false;

  typeColors: Record<string, string> = {
    SMOKE: '#607d8b',
    FLASH: '#fbc02d',
    MOLOTOV: '#e64a19',
    HE: '#388e3c'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lineupService: LineupService,
    private favoriteService: FavoriteService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.lineupService.getById(id).subscribe({
        next: lineup => { this.lineup = lineup; this.loading = false; },
        error: () => {
          this.snackBar.open('Lineup introuvable', 'Fermer', { duration: 3000 });
          this.router.navigate(['/lineups']);
        }
      });
    }
  }

  toggleFavorite(): void {
    if (!this.lineup) return;
    const action$ = this.lineup.favorite
      ? this.favoriteService.removeFavorite(this.lineup.id)
      : this.favoriteService.addFavorite(this.lineup.id);

    action$.subscribe({
      next: () => {
        this.lineup!.favorite = !this.lineup!.favorite;
        this.snackBar.open(
          this.lineup!.favorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
          '', { duration: 2000 }
        );
      }
    });
  }

  deleteLineup(): void {
    if (!this.lineup || !confirm(`Supprimer la lineup "${this.lineup.name}" ?`)) return;
    this.lineupService.delete(this.lineup.id).subscribe({
      next: () => {
        this.snackBar.open('Lineup supprimée', '', { duration: 2000 });
        this.router.navigate(['/lineups']);
      }
    });
  }
}
