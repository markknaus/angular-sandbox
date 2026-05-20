import { Component, signal } from '@angular/core';
import { DebouncedSearchComponent } from './practice/ng/debounced-search/debounced-search.component';
import { ReactiveFormComponent } from './practice/ng/reactive-form/reactive-form.component';
import { OnpushDemoComponent } from './practice/ng/onpush-demo/onpush-demo.component';
import { RxjsOperatorsComponent } from './practice/ng/rxjs-operators/rxjs-operators.component';
import { DataTableDemoComponent } from './practice/ng/data-table/data-table.component';

type PracticeView = 'debounced-search' | 'reactive-form' | 'onpush-demo' | 'rxjs-operators' | 'data-table';

@Component({
  selector: 'app-root',
  imports: [
    DebouncedSearchComponent,
    ReactiveFormComponent,
    OnpushDemoComponent,
    RxjsOperatorsComponent,
    DataTableDemoComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Angular Sandbox');
  protected activeView = signal<PracticeView>('debounced-search');

  protected readonly navItems: { id: PracticeView; label: string }[] = [
    { id: 'debounced-search', label: 'NG-01 Debounced Search' },
    { id: 'reactive-form',    label: 'NG-02 Reactive Form'    },
    { id: 'onpush-demo',      label: 'NG-03 OnPush Demo'      },
    { id: 'rxjs-operators',   label: 'NG-04 RxJS Operators'   },
    { id: 'data-table',       label: 'NG-05 Data Table'       },
  ];

  protected setView(view: PracticeView): void {
    this.activeView.set(view);
  }
}