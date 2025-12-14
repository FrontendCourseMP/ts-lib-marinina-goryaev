class BaseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class FormNotFoundError extends BaseValidationError {
  constructor(selector: string) {
    super(`Форма с селектором "${selector}" не найдена`);
  }
}

export class FieldNotFoundError extends BaseValidationError {
  constructor(selector: string) {
    super(`Поле с селектором "${selector}" не найдено`);
  }
}

export class ErrorContainerNotFoundError extends BaseValidationError {
  constructor(selector: string) {
    super(`Контейнер ошибок для поля "${selector}" не найден`);
  }
}

export class UnknownRuleError extends BaseValidationError {
  constructor(ruleName: string) {
    super(`Неизвестное правило валидации "${ruleName}"`);
  }
}

