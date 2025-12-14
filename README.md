# MGValidator
TypeScript библиотека для валидации HTML форм с поддержкой встроенных и пользовательских правил валидации.

## Требования

### К браузеру
- ES2020+ поддержка
- DOM API (HTMLFormElement, HTMLInputElement)

### К HTML форме
- Форма должна иметь `id` или уникальный селектор
- Каждое поле должно быть элементом `<input>`, `<textarea>` или `<select>` с уникальным селектором
- Для вывода ошибок необходим контейнер (div, span или другой элемент) рядом с полем

### Пример HTML структуры
```html
<form id="myForm">
  <div>
    <label for="username">Имя пользователя:</label>
    <input type="text" id="username" name="username" />
    <div id="usernameError" class="error-container"></div>
  </div>
  
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" />
    <div id="emailError" class="error-container"></div>
  </div>
  
  <div>
    <label for="password">Пароль:</label>
    <input type="password" id="password" name="password" />
    <div id="passwordError" class="error-container"></div>
  </div>
  
  <button type="submit">Отправить</button>
</form>
```

## QuickStart

### Установка
```bash
npm install ts-val
```

### Пример
```typescript
import { MGValidator } from './src/main';

const validator = new MGValidator('#myForm');

validator
  .addField('#username', {
    rules: [
      {
        rule: 'required',
        value: null,
        errorMessage: 'Имя пользователя обязательно'
      },
      {
        rule: 'minLength',
        value: 3,
        errorMessage: 'Минимум 3 символа'
      }
    ],
    errorContainer: '#usernameError'
  })
  .addField('#email', {
    rules: [
      {
        rule: 'required',
        value: null,
        errorMessage: 'Email обязателен'
      },
      {
        rule: 'email',
        value: null,
        errorMessage: 'Некорректный формат email'
      }
    ],
    errorContainer: '#emailError'
  })
  .onSuccess((event) => {
    console.log('Форма успешно валидирована!');
  })
  .onFail((result) => {
    console.log('Ошибки валидации:', result.errors);
  });
```

### Полный пример с паролем и подтверждением
```typescript
const validator = new MGValidator('#registerForm');

validator
  .addField('#username', {
    rules: [
      {
        rule: 'required',
        value: null,
        errorMessage: 'Имя обязательно'
      },
      {
        rule: 'latinOrCyrillic',
        value: null,
        errorMessage: 'Только буквы'
      }
    ],
    errorContainer: '#usernameError'
  })
  .addField('#password', {
    rules: [
      {
        rule: 'required',
        value: null,
        errorMessage: 'Пароль обязателен'
      },
      {
        rule: 'strongPassword',
        value: null,
        errorMessage: 'Минимум 8 символов, буквы (большие и маленькие) и цифры'
      }
    ],
    errorContainer: '#passwordError'
  })
  .addField('#passwordConfirm', {
    rules: [
      {
        rule: 'required',
        value: null,
        errorMessage: 'Подтверждение пароля обязательно'
      },
      {
        rule: 'equals',
        value: '#password',
        errorMessage: 'Пароли не совпадают'
      }
    ],
    errorContainer: '#passwordConfirmError'
  })
  .addField('#phone', {
    rules: [
      {
        rule: 'phone',
        value: null,
        errorMessage: 'Введите корректный номер телефона (минимум 10 цифр)'
      }
    ],
    errorContainer: '#phoneError'
  })
  .addField('#birthDate', {
    rules: [
      {
        rule: 'required',
        value: null,
        errorMessage: 'Дата рождения обязательна'
      },
      {
        rule: 'dateNotFuture',
        value: null,
        errorMessage: 'Дата не может быть в будущем'
      }
    ],
    errorContainer: '#birthDateError'
  })
  .onSuccess(() => {
    alert('Регистрация успешна!');
  })
  .onFail((result) => {
    console.error('Ошибки:', result.errors);
  });
```

## API Reference

### Класс MGValidator

#### Конструктор
```typescript
/**
 * Создает новый экземпляр валидатора
 * @param formSelector - CSS селектор HTML формы
 * @throws FormNotFoundError если форма не найдена
 */
constructor(formSelector: string)
```

#### addField()
```typescript
/**
 * Добавляет поле для валидации
 * @param fieldSelector - CSS селектор поля для валидации
 * @param config - конфигурация правил валидации для поля
 * @returns текущий экземпляр для цепочки методов
 * @throws FieldNotFoundError если поле не найдено в DOM
 */
addField(fieldSelector: string, config: FieldConfig): this
```

#### validate()
```typescript
/**
 * Запускает валидацию всех добавленных полей
 * @returns объект ValidationResult с результатом валидации
 */
validate(): ValidationResult
```

#### onSuccess()
```typescript
/**
 * Устанавливает callback функцию, которая вызывается при успешной валидации
 * @param callback - функция обработки события
 * @returns текущий экземпляр для цепочки методов
 */
onSuccess(callback: (event: Event) => void): this
```

#### onFail()
```typescript
/**
 * Устанавливает callback функцию, которая вызывается при ошибке валидации
 * @param callback - функция обработки ошибок с объектом ValidationResult
 * @returns текущий экземпляр для цепочки методов
 */
onFail(callback: (result: ValidationResult) => void): this
```

### Типы данных

#### ValidationRule
```typescript
type ValidationRule = {
  rule: string;           // Название правила валидации
  value: any;             // Значение параметра
  errorMessage: string;   // Сообщение об ошибке на русском
}
```

#### FieldConfig
```typescript
type FieldConfig = {
  rules: ValidationRule[];              // Массив правил валидации
  errorContainer: string | HTMLElement; // CSS селектор или элемент для вывода ошибок
}
```

#### ValidationResult
```typescript
type ValidationResult = {
  isValid: boolean;                     // Статус валидации
  errors: {
    field: string;                      // Селектор поля с ошибкой
    message: string;                    // Сообщение об ошибке
  }[];
}
```

### Встроенные правила валидации

| Правило | Параметр | Описание | Пример |
|---------|----------|---------|---------|
| `required` | null | Поле не должно быть пустым | `{ rule: 'required', value: null, errorMessage: '...' }` |
| `minLength` | число | Минимальная длина строки | `{ rule: 'minLength', value: 3, errorMessage: '...' }` |
| `maxLength` | число | Максимальная длина строки | `{ rule: 'maxLength', value: 20, errorMessage: '...' }` |
| `email` | null | Проверка формата email | `{ rule: 'email', value: null, errorMessage: '...' }` |
| `hasAtSign` | null | Наличие символа @ | `{ rule: 'hasAtSign', value: null, errorMessage: '...' }` |
| `hasDot` | null | Наличие точки | `{ rule: 'hasDot', value: null, errorMessage: '...' }` |
| `latinOrCyrillic` | null | Только латинские и кириллические буквы | `{ rule: 'latinOrCyrillic', value: null, errorMessage: '...' }` |
| `pattern` | RegExp строка | Проверка по регулярному выражению | `{ rule: 'pattern', value: '^[0-9]+$', errorMessage: '...' }` |
| `phone` | null | Номер телефона (минимум 10 цифр, без букв) | `{ rule: 'phone', value: null, errorMessage: '...' }` |
| `strongPassword` | null | Сильный пароль (8+ символов, буквы разного регистра, цифры) | `{ rule: 'strongPassword', value: null, errorMessage: '...' }` |
| `dateNotFuture` | null | Дата не больше текущей даты | `{ rule: 'dateNotFuture', value: null, errorMessage: '...' }` |
| `equals` | селектор поля | Значение совпадает с другим полем | `{ rule: 'equals', value: '#password', errorMessage: '...' }` |
| `custom` | функция | Пользовательская функция валидации | `{ rule: 'custom', value: (val) => val.length > 5, errorMessage: '...' }` |

### Исключения

#### FormNotFoundError
```typescript
/**
 * Выбрасывается когда форма с заданным селектором не найдена в DOM
 */
class FormNotFoundError extends Error
```

#### FieldNotFoundError
```typescript
/**
 * Выбрасывается когда поле с заданным селектором не найдено в DOM
 */
class FieldNotFoundError extends Error
```

#### ErrorContainerNotFoundError
```typescript
/**
 * Выбрасывается когда контейнер для вывода ошибок не найден в DOM
 */
class ErrorContainerNotFoundError extends Error
```

#### UnknownRuleError
```typescript
/**
 * Выбрасывается при попытке использовать неизвестное правило валидации
 */
class UnknownRuleError extends Error
```

## Примеры использования

### Пример 1: Валидация с пользовательским правилом
```typescript
const validator = new MGValidator('#form');

validator.addField('#username', {
  rules: [
    {
      rule: 'required',
      value: null,
      errorMessage: 'Имя обязательно'
    },
    {
      rule: 'custom',
      value: (val: string) => !val.includes(' '),
      errorMessage: 'Имя не должно содержать пробелы'
    }
  ],
  errorContainer: '#usernameError'
});
```

### Пример 2: Валидация контактной информации
```typescript
validator
  .addField('#email', {
    rules: [
      { rule: 'required', value: null, errorMessage: 'Email обязателен' },
      { rule: 'email', value: null, errorMessage: 'Некорректный email' }
    ],
    errorContainer: '#emailError'
  })
  .addField('#phone', {
    rules: [
      { rule: 'required', value: null, errorMessage: 'Телефон обязателен' },
      { rule: 'phone', value: null, errorMessage: 'Некорректный номер (10+ цифр)' }
    ],
    errorContainer: '#phoneError'
  });
```


## Авторы

**marinina-goryaev** \
Маринина Анастасия - Prinkley \

