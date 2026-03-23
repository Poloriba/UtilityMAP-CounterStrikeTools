import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { Lineup, LineupFilter, Side, UtilityType } from '../../models/lineup.model';
import { LineupService } from '../../services/lineup.service';

@Component({
  selector: 'app-lineup-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatChipsModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatBadgeModule
  ],
  templateUrl: './lineup-list.component.html',
  styleUrls: ['./lineup-list.component.scss']
})
/** Page listant toutes les lineups, avec filtres combinables (map, côté, type, recherche textuelle) */
export class LineupListComponent implements OnInit {
  lineups: Lineup[] = [];  // résultats affichés
  loading = false;          // indicateur de chargement
  filterForm: FormGroup;    // formulaire réactif des filtres

  maps = ['Mirage', 'Inferno', 'Dust2', 'Nuke', 'Vertigo', 'Anubis', 'Ancient'];
  sides: Side[] = ['T', 'CT'];
  types: UtilityType[] = ['SMOKE', 'FLASH', 'MOLOTOV', 'HE'];

  // Couleurs associées à chaque type (utilisées pour les badges dans le template)
  typeColors: Record<UtilityType, string> = {
    SMOKE: '#607d8b',
    FLASH: '#fbc02d',
    MOLOTOV: '#e64a19',
    HE: '#388e3c'
  };

  constructor(private lineupService: LineupService, private fb: FormBuilder, private route: ActivatedRoute) {
    this.filterForm = this.fb.group({
      map: [null],
      side: [null],
      type: [null],
      search: ['']
    });
  }

  ngOnInit(): void {
    // Pré-remplit le filtre map depuis le query param ?map= (navigation depuis le Playground)
    const mapParam = this.route.snapshot.queryParamMap.get('map');
    if (mapParam) {
      this.filterForm.patchValue({ map: mapParam });
    }
    this.loadLineups();
    // Recharge automatiquement à chaque changement de filtre (avec debounce pour la recherche texte)
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadLineups());
  }

  // Charge les lineups en appliquant les filtres actifs du formulaire
  loadLineups(): void {
    this.loading = true;
    const { map, side, type, search } = this.filterForm.value;
    const filter: LineupFilter = {};
    if (map) filter.map = map;
    if (side) filter.side = side;
    if (type) filter.type = type;
    if (search?.trim()) filter.search = search.trim();

    this.lineupService.getAll(filter).subscribe({
      next: data => { this.lineups = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  // Réinitialise tous les filtres à leurs valeurs par défaut
  resetFilters(): void {
    this.filterForm.reset({ map: null, side: null, type: null, search: '' });
  }
}
