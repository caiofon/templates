import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  options?: { value: string; label: string }[];
  validators?: any[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface FormSchema {
  fields: FieldConfig[];
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      @for (field of schema.fields; track field.name) {
        <div class="form-group">
          <label [for]="field.name" class="block text-sm font-medium mb-1">
            {{ field.label }}
            @if (field.required) {
              <span class="text-red-500">*</span>
            }
          </label>

          @switch (field.type) {
            @case ('text') {
              <input
                [id]="field.name"
                [formControlName]="field.name"
                type="text"
                [placeholder]="field.placeholder || ''"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            }
            @case ('email') {
              <input
                [id]="field.name"
                [formControlName]="field.name"
                type="email"
                [placeholder]="field.placeholder || ''"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            }
            @case ('number') {
              <input
                [id]="field.name"
                [formControlName]="field.name"
                type="number"
                [min]="field.min"
                [max]="field.max"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            }
            @case ('date') {
              <input
                [id]="field.name"
                [formControlName]="field.name"
                type="date"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            }
            @case ('select') {
              <select
                [id]="field.name"
                [formControlName]="field.name"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              >
                <option value="">Select...</option>
                @for (option of field.options; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            }
            @case ('textarea') {
              <textarea
                [id]="field.name"
                [formControlName]="field.name"
                [placeholder]="field.placeholder || ''"
                rows="4"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              ></textarea>
            }
            @case ('checkbox') {
              <label class="flex items-center gap-2">
                <input
                  [id]="field.name"
                  [formControlName]="field.name"
                  type="checkbox"
                  class="rounded"
                />
                <span>{{ field.placeholder }}</span>
              </label>
            }
          }

          @if (getFieldError(field.name)) {
            <p class="text-red-500 text-sm mt-1">{{ getFieldError(field.name) }}</p>
          }
        </div>
      }

      <div class="flex gap-4 pt-4">
        <button
          type="submit"
          [disabled]="form.invalid || isSubmitting()"
          class="px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
        >
          {{ isSubmitting() ? 'Saving...' : (editMode ? 'Update' : 'Create') }}
        </button>
        <button
          type="button"
          (click)="onCancel()"
          class="px-6 py-2 border rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  `,
})
export class DynamicFormComponent {
  @Input() schema!: FormSchema;
  @Input() initialData?: Record<string, any>;
  @Input() editMode = false;

  @Output() formSubmit = new EventEmitter<Record<string, any>>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = signal(false);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
  }

  ngOnChanges() {
    if (this.form && this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  private buildForm() {
    const controls: Record<string, any> = {};

    for (const field of this.schema.fields) {
      const validators = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      if (field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }

      if (field.max !== undefined) {
        validators.push(Validators.max(field.max));
      }

      controls[field.name] = [
        this.initialData?.[field.name] ?? (field.type === 'checkbox' ? false : ''),
        validators,
      ];
    }

    this.form = this.fb.group(controls);
  }

  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (control?.touched && control.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;
    }
    return null;
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      this.formSubmit.emit(this.form.value);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
