/**
 * NG-04: RxJS Operator Deep Dive
 * ================================
 * Concept: switchMap, mergeMap, combineLatest, catchError, retry, takeUntilDestroyed
 *
 * Objective:
 *   Four isolated exercises in one component. Each exercise targets one
 *   operator or pattern. Results are displayed in the UI and logged to console.
 *
 * Exercise A — switchMap vs mergeMap
 *   Simulate rapid button clicks. Show that switchMap cancels in-flight
 *   requests while mergeMap lets them all complete.
 *
 * Exercise B — combineLatest
 *   Two dropdowns (role and feature list). Use combineLatest to show only
 *   features the selected role is allowed to see.
 *
 * Exercise C — catchError and retry
 *   A button triggers an observable that fails 70% of the time.
 *   Use retry(3) then catchError to handle the failure gracefully.
 *
 * Exercise D — takeUntilDestroyed
 *   An interval that logs every second. Must stop when component is destroyed.
 *   Verify in console that it stops when you navigate away.
 *
 * Hints and solution: docs/practice-hints/ng-hints-and-solutions.md
 * How to run: ng serve then open http://localhost:4200
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  interval,
  map,
  mergeMap,
  Observable,
  of,
  retry,
  Subject,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { delay } from 'rxjs/operators';

// ============================================================
// MOCK DATA — do not modify
// ============================================================

export interface Feature {
  name: string;
  requiredRole: 'user' | 'admin';
}

export const ALL_FEATURES: Feature[] = [
  { name: 'Dashboard',  requiredRole: 'user'  },
  { name: 'Reports',    requiredRole: 'admin' },
  { name: 'Settings',   requiredRole: 'admin' },
  { name: 'Profile',    requiredRole: 'user'  },
  { name: 'Audit Log',  requiredRole: 'admin' },
];

function mockRequest(label: string): Observable<string> {
  return of(`${label} completed`).pipe(delay(800));
}

function unreliableRequest(): Observable<string> {
  return new Observable(observer => {
    if (Math.random() > 0.3) {
      observer.error(new Error('Request failed'));
    } else {
      observer.next('Success!');
      observer.complete();
    }
  });
}

// ============================================================
// SOLUTION — complete the component below
// ============================================================

@Component({
  selector: 'app-rxjs-operators',
  imports: [FormsModule],
  templateUrl: './rxjs-operators.component.html',
  styleUrl: './rxjs-operators.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RxjsOperatorsComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  // Exercise A
  switchMapLog = signal<string[]>([]);
  mergeMapLog  = signal<string[]>([]);
  private clickSubject = new Subject<number>();
  private clickCount = 0;

  // Exercise B
  role$ = new BehaviorSubject<'user' | 'admin'>('user');
  selectedRole: 'user' | 'admin' = 'user';
  visibleFeatures = signal<Feature[]>([]);

  // Exercise C
  retryResult = signal<string>('');
  retryAttempts = signal<number>(0);

  // Exercise D
  intervalLog = signal<string[]>([]);

  ngOnInit(): void {
    // TODO Exercise A:
    // Subscribe to clickSubject using switchMap — only latest click completes
    // Subscribe to clickSubject using mergeMap — all clicks complete
    // Use takeUntilDestroyed() to clean up

    // TODO Exercise B:
    // Use combineLatest([this.role$, of(ALL_FEATURES)]) to derive visibleFeatures
    // Filter features where feature.requiredRole === role OR role === 'admin'

    // TODO Exercise C:
    // Wire up in triggerUnreliable() below

    // TODO Exercise D:
    // Create an interval(1000) that logs to intervalLog every second
    // Use takeUntilDestroyed() so it stops when component is destroyed
  }

  // Exercise A — called by the button in the template
  triggerClick(): void {
    this.clickCount++;
    // TODO: emit clickCount to clickSubject
  }

  onRoleChange(): void {
    this.role$.next(this.selectedRole);
  }

  // Exercise C — called by the button in the template
  triggerUnreliable(): void {
    this.retryAttempts.set(0);
    this.retryResult.set('Trying...');
    // TODO: subscribe to unreliableRequest() with retry(3) and catchError
    // Update retryAttempts on each attempt using tap
    // Update retryResult with success message or 'Failed after 3 retries'
  }
}
