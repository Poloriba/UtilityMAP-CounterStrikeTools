import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LineupRequest, Side, UtilityType } from '../../models/lineup.model';
import { LineupService } from '../../services/lineup.service';

@Component({
  selector: 'app-lineup-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './lineup-form.component.html',
  styleUrls: ['./lineup-form.component.scss']
})
export class LineupFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  lineupId?: string;
  loading = false;
  saving = false;

  maps = ['Mirage', 'Inferno', 'Dust2', 'Nuke', 'Vertigo', 'Anubis', 'Ancient'];
  sides: Side[] = ['T', 'CT'];
  types: UtilityType[] = ['SMOKE', 'FLASH', 'MOLOTOV', 'HE'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lineupService: LineupService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      mapName: [null, Validators.required],
      side: [null, Validators.required],
      utilityType: [null, Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      throwPosition: [''],
      aimPosition: [''],
      imageUrl: [''],
      videoUrl: ['']
    });
  }

  ngOnInit(): void {
    this.lineupId = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.isEdit = !!this.lineupId && this.route.snapshot.url.some(s => s.path === 'edit');

    if (this.isEdit && this.lineupId) {
      this.loading = true;
      this.lineupService.getById(this.lineupId).subscribe({
        next: lineup => {
          this.form.patchValue(lineup);
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Lineup introuvable', 'Fermer', { duration: 3000 });
          this.router.navigate(['/lineups']);
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const request = this.form.value as LineupRequest;
    const action$ = this.isEdit && this.lineupId
      ? this.lineupService.update(this.lineupId, request)
      : this.lineupService.create(request);

    action$.subscribe({
      next: lineup => {
        this.snackBar.open(
          this.isEdit ? 'Lineup mise à jour !' : 'Lineup créée !',
          '', { duration: 2000 }
        );
        this.router.navigate(['/lineups', lineup.id]);
      },
      error: () => {
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
        this.saving = false;
      }
    });
  }
}
