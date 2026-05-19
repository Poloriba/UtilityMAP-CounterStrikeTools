import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { PlaygroundComponent } from '../playground/playground.component';
import { PlaygroundMobileComponent } from '../playground-mobile/playground-mobile.component';

/**
 * Wrapper qui choisit entre la vue Playground complète (desktop) et la vue mobile read-only.
 * Le breakpoint est aligné sur 768px (même que la toolbar responsive).
 */
@Component({
  selector: 'app-playground-router',
  standalone: true,
  imports: [CommonModule, PlaygroundComponent, PlaygroundMobileComponent],
  template: `
    <app-playground-mobile *ngIf="isMobile; else desktop" />
    <ng-template #desktop>
      <app-playground />
    </ng-template>
  `,
})
export class PlaygroundRouterComponent implements OnDestroy {
  private readonly observer = inject(BreakpointObserver);
  isMobile = false;
  private readonly sub: Subscription;

  constructor() {
    this.sub = this.observer.observe('(max-width: 768px)').subscribe(state => {
      this.isMobile = state.matches;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
