import type { ValidationRule, ValidationResult, FieldConfig } from './types/types';

export class MGValidator {
  private formSelector: string;
  private fields: Map<string, FieldConfig> = new Map();
  private successCallback?: (event: Event) => void;
  private failCallback?: (result: ValidationResult) => void;

  constructor(formSelector: string) {
    this.formSelector = formSelector;
    this.initForm();
  }

  private initForm(): void {
    const form = document.querySelector(this.formSelector) as HTMLFormElement;
    if (!form) {
      console.warn(`Форма с селектором "${this.formSelector}" не найдена`);
      return;
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.validate();
    });
  }

  addField(fieldSelector: string, config: FieldConfig): this {
    const field = document.querySelector(fieldSelector) as HTMLInputElement;

    if (!field) {
      console.warn(`Поле с селектором "${fieldSelector}" не найдено`);
      return this;
    }

    this.fields.set(fieldSelector, config);
    console.log(`Поле "${fieldSelector}" добавлено для валидации`);

    return this;
  }

  private validateField(fieldSelector: string, config: FieldConfig): { isValid: boolean; errors: string[] } {
    const field = document.querySelector(fieldSelector) as HTMLInputElement;
    const errors: string[] = [];

    if (!field) {
      return { isValid: false, errors: ['Поле не найдено'] };
    }

    const value = field.value.trim();

    for (const rule of config.rules) {
      if (!this.checkRule(value, rule)) {
        errors.push(rule.errorMessage);
      }
    }

    // Обновить стили поля
    this.updateFieldStyles(field, errors.length === 0);

    // Отобразить ошибки под полем
    this.displayErrors(fieldSelector, errors, config);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private checkRule(value: string, rule: ValidationRule): boolean {
    switch (rule.rule) {
      case 'required':
        return value.length > 0;

      case 'minLength':
        return value.length >= (rule.value || 0);

      case 'maxLength':
        return value.length <= (rule.value || Infinity);

      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      case 'hasAtSign':
        return value.includes('@');

      case 'latinOrCyrillic':
        return /^[a-zA-Zа-яА-ЯёЁ\s]*$/.test(value);

      case 'pattern':
        return new RegExp(rule.value).test(value);

      case 'custom':
        return typeof rule.value === 'function' ? rule.value(value) : true;

      default:
        return true;
    }
  }

  validate(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
    };

    this.fields.forEach((config, fieldSelector) => {
      const validation = this.validateField(fieldSelector, config);

      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push({
          field: fieldSelector,
          message: validation.errors.join(', '),
        });
      }
    });

    console.log('Результат валидации:', result);

    if (result.isValid && this.successCallback) {
      this.successCallback(new Event('submit'));
    } else if (!result.isValid && this.failCallback) {
      this.failCallback(result);
    }

    return result;
  }

  onSuccess(callback: (event: Event) => void): this {
    this.successCallback = callback;
    return this;
  }

  onFail(callback: (result: ValidationResult) => void): this {
    this.failCallback = callback;
    return this;
  }

  private updateFieldStyles(field: HTMLInputElement, isValid: boolean): void {
    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
    }
  }

  private displayErrors(
    fieldSelector: string,
    errors: string[],
    config: FieldConfig
  ): void {
    let errorContainer: HTMLElement | null = null;

    if (typeof config.errorContainer === 'string') {
      errorContainer = document.querySelector(config.errorContainer);
    } else {
      errorContainer = config.errorContainer;
    }

    if (!errorContainer) {
      console.warn(`Контейнер ошибок для поля "${fieldSelector}" не найден`);
      return;
    }

    errorContainer.innerHTML = '';

    if (errors.length > 0) {
      errors.forEach((error) => {
        const errorElement = document.createElement('span');
        errorElement.textContent = error;
        errorContainer?.appendChild(errorElement);
      });
    }
  }
}
