/**
 * NG-03: OnPush Change Detection
 * ================================
 * Concept: ChangeDetectionStrategy.OnPush, signals, immutability
 *
 * Objective:
 *   Build a product list that demonstrates how OnPush change detection works.
 *   You will see WHY direct mutation fails and WHY immutable updates succeed.
 *
 * Requirements:
 *   - Parent holds a signal of Product[]
 *   - ProductCardComponent uses OnPush (already done for you below)
 *   - Button 1: Add a new product — list must update correctly
 *   - Button 2: Mutate an existing product's price DIRECTLY — OnPush will NOT detect this
 *   - Button 3: Update a product's price IMMUTABLY — OnPush WILL detect this
 *   - Use OnPush on both parent and child components
 *   - Use inject() instead of constructor injection
 *
 * Hints and solution: docs/practice-hints/ng-hints-and-solutions.md
 * How to run: ng serve then open http://localhost:4200
 */

import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';

// ============================================================
// PRODUCT INTERFACE — do not modify
// ============================================================

export interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

// ============================================================
// PRODUCT CARD COMPONENT — do not modify
// ============================================================

@Component({
  selector: 'app-product-card',
  template: `
    <div class="card">
      <h3>{{ product().name }}</h3>
      <p class="price">\${{ product().price.toFixed(2) }}</p>
      <p class="stock" [class.out]="!product().inStock">
        {{ product().inStock ? 'In Stock' : 'Out of Stock' }}
      </p>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 1rem;
      background: #fafafa;
    }
    h3 { margin: 0 0 0.5rem 0; font-size: 1rem; }
    .price { font-weight: bold; color: #1a1a2e; margin: 0.25rem 0; }
    .stock { font-size: 0.85rem; color: green; margin: 0; }
    .stock.out { color: #c0392b; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product = input.required<Product>();
}

// ============================================================
// SOLUTION — complete the parent component below
// ============================================================

@Component({
  selector: 'app-onpush-demo',
  imports: [],
  templateUrl: './onpush-demo.component.html',
  styleUrl: './onpush-demo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnpushDemoComponent {

  private nextId = 4;

  // TODO: create a products signal initialized with starterProducts
  // products = signal<Product[]>([...this.starterProducts]);
  products = signal<Product[]>([
    { id: 1, name: 'Angular Handbook',   price: 39.99, inStock: true  },
    { id: 2, name: 'RxJS Deep Dive',     price: 29.99, inStock: true  },
    { id: 3, name: 'TypeScript Mastery', price: 34.99, inStock: false },
  ]);

  // TODO: implement addProduct
  // Add a new product to the signal immutably using update()
  addProduct(): void {
    // your code here
    console.log('addProduct not yet implemented');
  }

  // TODO: implement mutatePriceDirectly
  // Do: this.products()[0].price += 5
  // Observe that the UI does NOT update (OnPush won't detect object mutation)
  mutatePriceDirectly(): void {
    // your code here
    console.log('Mutated directly — UI should NOT update');
  }

  // TODO: implement updatePriceImmutably
  // Create a new array with a new first object with price += 5
  // Use this.products.update(...)
  updatePriceImmutably(): void {
    // your code here
    console.log('Updated immutably — UI should update');
  }
}