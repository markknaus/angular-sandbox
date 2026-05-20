/**
 * NG-01: Debounced Search Component
 * ===================================
 * Concept: RxJS, debounceTime, switchMap, async pipe, takeUntilDestroyed
 *
 * Objective:
 *   Build a search component that calls a mock search service as the user
 *   types, but debounces input so the service is only called after the user
 *   stops typing for 400ms. Show a loading indicator while searching and
 *   display results in a list. Handle errors gracefully.
 *
 * Requirements:
 *   - Use ReactiveFormsModule with a FormControl for the input
 *   - Use RxJS: debounceTime, distinctUntilChanged, switchMap, takeUntilDestroyed
 *   - Show a loading indicator during the request
 *   - Display results as a list
 *   - Handle errors — show a friendly error message
 *   - No memory leaks — use takeUntilDestroyed
 *   - Use OnPush change detection
 *   - Use inject() instead of constructor injection
 *
 * Hints and solution: docs/practice-hints/ng-hints-and-solutions.md
 * How to run: ng serve then open http://localhost:4200
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// ============================================================
// MOCK SERVICE — do not modify
// ============================================================

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SearchService {
  search(query: string): Observable<string[]> {
    if (!query.trim()) return of([]);
    return of([
      `${query} — Result 1`,
      `${query} — Result 2`,
      `${query} — Result 3`,
    ]).pipe(delay(600));
  }
}

// ============================================================
// SOLUTION — complete the component below
// ============================================================

@Component({
  selector: 'app-debounced-search',
  imports: [ReactiveFormsModule],
  templateUrl: './debounced-search.component.html',
  styleUrl: './debounced-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebouncedSearchComponent implements OnInit {

  // TODO: inject SearchService and ChangeDetectorRef
  // private searchService = inject(SearchService);
  // private cdr = inject(ChangeDetectorRef);

  searchControl = new FormControl('');
  results: string[] = [];
  loading = false;
  error = false;

  ngOnInit(): void {
    // TODO: subscribe to searchControl.valueChanges
    // Chain: debounceTime(400), distinctUntilChanged(), switchMap, takeUntilDestroyed
    // Set loading = true before the switchMap
    // Set loading = false and update results after
    // Handle errors with catchError
    // Call this.cdr.markForCheck() after updating state (needed for OnPush)
  }
}
