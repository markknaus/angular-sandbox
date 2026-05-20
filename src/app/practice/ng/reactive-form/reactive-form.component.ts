/**
 * NG-02: Reactive Form With Custom Validation
 * ============================================
 * Concept: ReactiveFormsModule, FormBuilder, custom validators, cross-field validation
 *
 * Objective:
 *   Build a user registration form with custom validation rules.
 *   All validation must use reactive forms — no template-driven validation.
 *
 * Fields and Rules:
 *   firstName       Required, min 2 characters
 *   lastName        Required, min 2 characters
 *   email           Required, valid email format
 *   password        Required, min 8 chars, must contain one number and one uppercase letter
 *   confirmPassword Must match the password field (cross-field validator on the group)
 *   role            Required, one of: admin, user, readonly
 *   agreeToTerms    Must be true
 *
 * Requirements:
 *   - Use FormBuilder and FormGroup
 *   - Write a custom validator for password complexity
 *   - Write a cross-field validator for password/confirmPassword match
 *   - Show inline error messages only when field is touched or form submitted
 *   - Disable the submit button when form is invalid
 *   - On valid submit log the form value (minus confirmPassword) to the console
 *   - Use OnPush change detection
 *   - Use inject() instead of constructor injection
 *
 * Hints and solution: docs/practice-hints/ng-hints-and-solutions.md
 * How to run: ng serve then open http://localhost:4200
 */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

// ============================================================
// CUSTOM VALIDATORS — write your validators here
// ============================================================

// TODO: Password complexity validator
// Must contain at least one uppercase letter and one number
// Return { passwordComplexity: true } if invalid, null if valid
export function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // your code here
    return null;
  };
}

// TODO: Cross-field password match validator (applied to the FormGroup)
// Return { passwordMismatch: true } if passwords do not match, null if they do
export function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    // your code here
    return null;
  };
}

// ============================================================
// SOLUTION — complete the component below
// ============================================================

@Component({
  selector: 'app-reactive-form',
  imports: [ReactiveFormsModule],
  templateUrl: './reactive-form.component.html',
  styleUrl: './reactive-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactiveFormComponent {
  private fb = inject(FormBuilder);

  submitted = signal(false);

  // TODO: build the form using this.fb.group()
  // Apply passwordComplexityValidator to the password control
  // Apply passwordMatchValidator to the group level
  form = this.fb.group({
    firstName:       ['', []],
    lastName:        ['', []],
    email:           ['', []],
    password:        ['', []],
    confirmPassword: ['', []],
    role:            ['', []],
    agreeToTerms:    [false, []],
  });

  // Helper to check if a field should show errors
  showError(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    // TODO: log form value minus confirmPassword
    const { confirmPassword, ...formValue } = this.form.value;
    console.log('Form submitted:', formValue);
  }
}
