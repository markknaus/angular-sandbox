/**
 * NG-05: Reusable Data Table
 * ===========================
 * Concept: Reusable components, sorting, filtering, pagination, OnPush, signals
 *
 * Objective:
 *   Build a reusable data table component that accepts generic data and column
 *   definitions. Sorting, filtering, and pagination all happen client-side.
 *
 * Requirements:
 *   - Component accepts items input (array of any object type)
 *   - Component accepts columns input defining which fields to display
 *   - Clicking a column header sorts by that column (toggle asc/desc)
 *   - A search input filters rows across all visible column values
 *   - Show 5 rows per page with previous/next controls
 *   - Use OnPush change detection
 *   - Use signals for all internal state
 *   - Use computed() to derive filtered, sorted, and paginated rows
 *
 * Hints and solution: docs/practice-hints/ng-hints-and-solutions.md
 * How to run: ng serve then open http://localhost:4200
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// ============================================================
// COLUMN DEFINITION INTERFACE — do not modify
// ============================================================

export interface ColumnDef {
  field: string;
  label: string;
  sortable?: boolean;
}

// ============================================================
// SOLUTION — complete the data table component
// ============================================================

@Component({
  selector: 'app-data-table',
  imports: [FormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  items   = input<Record<string, string | number | boolean>[]>([]);
  columns = input<ColumnDef[]>([]);

  searchTerm  = signal('');
  sortField   = signal('');
  sortAsc     = signal(true);
  currentPage = signal(1);
  pageSize    = signal(5);

  // TODO: implement filteredRows computed signal
  filteredRows = computed(() => {
    // your code here
    return this.items();
  });

  // TODO: implement sortedRows computed signal
  sortedRows = computed(() => {
    // your code here
    return this.filteredRows();
  });

  // TODO: implement totalPages computed signal
  totalPages = computed(() => {
    // your code here
    return 1;
  });

  // TODO: implement paginatedRows computed signal
  paginatedRows = computed(() => {
    // your code here
    return this.sortedRows();
  });

  // TODO: implement onSort
  onSort(field: string): void {
    // your code here
  }

  // TODO: implement onSearch — reset page to 1 when term changes
  onSearch(term: string): void {
    // your code here
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  getCellValue(row: Record<string, string | number | boolean>, field: string): string | number | boolean {
    return row[field];
  }
}

// ============================================================
// DEMO WRAPPER — wires the table up with sample data
// ============================================================

export interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  salary: number;
}

@Component({
  selector: 'app-data-table-demo',
  imports: [DataTableComponent],
  template: `
    <section>
      <h2>NG-05: Reusable Data Table</h2>
      <p class="objective">
        Search, sort columns, and paginate through the employee data below.
        All logic happens client-side with signals and computed().
      </p>
      <app-data-table [items]="employeesAsRecords" [columns]="columns" />
    </section>
  `,
  styles: [`
    section {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }
    h2 { margin-top: 0; }
    .objective { color: #555; font-size: 0.9rem; margin-bottom: 1.5rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableDemoComponent {
  columns: ColumnDef[] = [
    { field: 'id',         label: 'ID',         sortable: true },
    { field: 'name',       label: 'Name',       sortable: true },
    { field: 'department', label: 'Department', sortable: true },
    { field: 'role',       label: 'Role',       sortable: true },
    { field: 'salary',     label: 'Salary',     sortable: true },
  ];

  employees: Employee[] = [
    { id:  1, name: 'Alice Johnson',   department: 'Engineering', role: 'Staff Engineer',     salary: 165000 },
    { id:  2, name: 'Bob Martinez',    department: 'Engineering', role: 'Senior Engineer',    salary: 145000 },
    { id:  3, name: 'Carol Smith',     department: 'Product',     role: 'Product Manager',    salary: 140000 },
    { id:  4, name: 'Dave Wilson',     department: 'Engineering', role: 'Junior Engineer',    salary: 105000 },
    { id:  5, name: 'Eve Davis',       department: 'Design',      role: 'UX Designer',        salary: 120000 },
    { id:  6, name: 'Frank Brown',     department: 'Engineering', role: 'Senior Engineer',    salary: 148000 },
    { id:  7, name: 'Grace Lee',       department: 'Product',     role: 'Product Manager',    salary: 138000 },
    { id:  8, name: 'Henry Taylor',    department: 'Engineering', role: 'Staff Engineer',     salary: 170000 },
    { id:  9, name: 'Iris Anderson',   department: 'Design',      role: 'Senior Designer',    salary: 125000 },
    { id: 10, name: 'Jack Thompson',   department: 'Engineering', role: 'Junior Engineer',    salary: 98000  },
    { id: 11, name: 'Karen White',     department: 'Engineering', role: 'Senior Engineer',    salary: 150000 },
    { id: 12, name: 'Liam Harris',     department: 'Product',     role: 'Associate PM',       salary: 118000 },
    { id: 13, name: 'Mia Clark',       department: 'Engineering', role: 'Senior Engineer',    salary: 147000 },
    { id: 14, name: 'Noah Lewis',      department: 'Design',      role: 'UX Designer',        salary: 115000 },
    { id: 15, name: 'Olivia Walker',   department: 'Engineering', role: 'Principal Engineer', salary: 185000 },
  ];

  // Cast employees to the type DataTableComponent expects
  get employeesAsRecords(): Record<string, string | number | boolean>[] {
    return this.employees as unknown as Record<string, string | number | boolean>[];
  }
}