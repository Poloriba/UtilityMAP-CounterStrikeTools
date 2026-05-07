import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Exec } from '../../models/exec.model';
import { ExecService } from '../../services/exec.service';
import { CS2_MAPS } from '../../models/map.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-exec-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatTooltipModule, MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './exec-list.component.html',
  styleUrls: ['./exec-list.component.scss']
})
/** Page listant toutes les execs sauvegardées, avec filtre par map */
export class ExecListComponent implements OnInit {
  execs: Exec[] = [];      // liste des execs chargées depuis l'API
  loading = false;          // indicateur de chargement
  selectedMap: string = ''; // filtre map sélectionné (vide = toutes)
  searchTerm: string = '';  // recherche par nom
  maps = CS2_MAPS;          // liste des maps pour le filtre

  // Execs filtrées par la recherche textuelle (le filtre map est déjà appliqué côté API)
  get filteredExecs(): Exec[] {
    if (!this.searchTerm.trim()) return this.execs;
    const term = this.searchTerm.toLowerCase().trim();
    return this.execs.filter(e => e.name.toLowerCase().includes(term));
  }

  constructor(
    private readonly execService: ExecService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadExecs();
  }

  // Charge les execs depuis l'API en appliquant le filtre map courant
  loadExecs(): void {
    this.loading = true;
    this.execService.getAll(this.selectedMap || undefined).subscribe({
      next: execs => { this.execs = execs; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  // Navigue vers le Playground en passant l'ID de l'exec dans l'URL (?exec=id)
  openInPlayground(exec: Exec): void {
    this.router.navigate(['/playground'], { queryParams: { exec: exec.id } });
  }

  // Supprime une exec après confirmation
  delete(exec: Exec): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer l\u2019exec',
        message: `Voulez-vous vraiment supprimer l'exec \u00ab ${exec.name} \u00bb ?`
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.execService.delete(exec.id).subscribe({
        next: () => {
          this.execs = this.execs.filter(e => e.id !== exec.id);
          this.snackBar.open('Exec supprim\u00e9e', 'Fermer', { duration: 2500 });
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
      });
    });
  }

  // Duplique une exec existante : demande un nouveau nom, puis crée une copie via l'API
  duplicate(exec: Exec): void {
    const newName = prompt('Nom de la copie :', `Copie de ${exec.name}`);
    if (!newName?.trim()) return;
    this.execService.create({
      name: newName.trim(),
      mapName: exec.mapName,
      snapshotJson: exec.snapshotJson,
      lineupIds: exec.lineups.map(l => l.id)
    }).subscribe({
      next: created => {
        this.execs = [...this.execs, created];
        this.snackBar.open(`Exec « ${created.name} » créée !`, 'Fermer', { duration: 2500 });
      },
      error: () => this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 })
    });
  }
}
