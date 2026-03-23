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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Exec } from '../../models/exec.model';
import { ExecService } from '../../services/exec.service';
import { CS2_MAPS } from '../../models/map.model';

@Component({
  selector: 'app-exec-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatSelectModule,
    MatFormFieldModule, MatTooltipModule, MatDividerModule
  ],
  templateUrl: './exec-list.component.html',
  styleUrls: ['./exec-list.component.scss']
})
/** Page listant toutes les execs sauvegardées, avec filtre par map */
export class ExecListComponent implements OnInit {
  execs: Exec[] = [];      // liste des execs affichées
  loading = false;          // indicateur de chargement
  selectedMap: string = ''; // filtre map sélectionné (vide = toutes)
  maps = CS2_MAPS;          // liste des maps pour le filtre

  constructor(
    private execService: ExecService,
    private router: Router,
    private snackBar: MatSnackBar
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
    if (!confirm(`Supprimer l'exec "${exec.name}" ?`)) return;
    this.execService.delete(exec.id).subscribe({
      next: () => {
        this.execs = this.execs.filter(e => e.id !== exec.id);
        this.snackBar.open('Exec supprimée', 'Fermer', { duration: 2500 });
      },
      error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
    });
  }
}
