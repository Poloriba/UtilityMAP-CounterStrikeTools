import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  // Forward navigation (left ← right slide + fade)
  transition(':increment', [
    style({ position: 'relative', overflow: 'hidden' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    query(':enter', [
      style({ left: '40px', opacity: 0 }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-out', style({ left: '-40px', opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms ease-out', style({ left: '0', opacity: 1 })),
      ], { optional: true }),
    ]),
  ]),

  // Back navigation (right → left slide + fade)
  transition(':decrement', [
    style({ position: 'relative', overflow: 'hidden' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    query(':enter', [
      style({ left: '-40px', opacity: 0 }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-out', style({ left: '40px', opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms ease-out', style({ left: '0', opacity: 1 })),
      ], { optional: true }),
    ]),
  ]),

  // Fallback: simple fade for same-level navigation
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0 }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('150ms ease-out', style({ opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        animate('250ms 100ms ease-in', style({ opacity: 1 })),
      ], { optional: true }),
    ]),
  ]),
]);
