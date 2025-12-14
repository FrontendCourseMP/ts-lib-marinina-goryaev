/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { MGValidator } from "../validator";
import {
  ErrorContainerNotFoundError,
  FieldNotFoundError,
  FormNotFoundError,
  UnknownRuleError,
} from "../errors";

const baseRules = [
  { rule: "required", value: undefined, errorMessage: "Поле обязательно" },
];

const mountForm = () => {
  document.body.innerHTML = `
    <form id="form">
      <input type="text" name="name" />
      <p class="name-errors" role="alert"></p>
      <input type="password" name="password" />
      <p class="password-errors" role="alert"></p>
      <input type="password" name="confirmPassword" />
      <p class="confirm-errors" role="alert"></p>
    </form>
  `;
};

describe("MGValidator errors and edge cases", () => {
  it("throws when form selector does not match any element", () => {
    document.body.innerHTML = `<form id="other"></form>`;
    expect(() => new MGValidator("#form")).toThrow(FormNotFoundError);
  });

  it("throws when adding a field that does not exist", () => {
    document.body.innerHTML = `<form id="form"></form>`;
    const validator = new MGValidator("#form");

    expect(() =>
      validator.addField('input[name="missing"]', {
        rules: baseRules,
        errorContainer: ".name-errors",
      })
    ).toThrow(FieldNotFoundError);
  });

  it("throws when error container is not found during validation", () => {
    mountForm();
    const validator = new MGValidator("#form");

    validator.addField('input[name="name"]', {
      rules: baseRules,
      errorContainer: ".missing-errors",
    });

    expect(() => validator.validate()).toThrow(ErrorContainerNotFoundError);
  });

  it("throws when equals rule targets a missing field", () => {
    mountForm();
    const validator = new MGValidator("#form");

    validator.addField('input[name="confirmPassword"]', {
      rules: [
        ...baseRules,
        {
          rule: "equals",
          value: 'input[name="absentPassword"]',
          errorMessage: "Пароли не совпадают",
        },
      ],
      errorContainer: ".confirm-errors",
    });

    expect(() => validator.validate()).toThrow(FieldNotFoundError);
  });

  it("throws on unknown validation rule", () => {
    mountForm();
    const validator = new MGValidator("#form");

    validator.addField('input[name="name"]', {
      rules: [
        ...baseRules,
        { rule: "totallyUnknown", value: null, errorMessage: "N/A" },
      ],
      errorContainer: ".name-errors",
    });

    expect(() => validator.validate()).toThrow(UnknownRuleError);
  });
});

const mountFullForm = () => {
  document.body.innerHTML = `
    <form id="form">
      <input type="text" name="name" />
      <p role="alert"></p>
      <input type="email" name="email" />
      <p role="alert"></p>
      <input type="password" name="password" />
      <p role="alert"></p>
      <input type="password" name="confirmPassword" />
      <p role="alert"></p>
      <input type="tel" name="phone" />
      <p role="alert"></p>
      <input type="date" name="birthDate" />
      <p role="alert"></p>
    </form>
  `;
};

describe("MGValidator field validation", () => {
  beforeEach(() => {
    mountFullForm();
  });

  describe("name field validation", () => {
    it("validates name with required, minLength(3), and latinOrCyrillic rules", () => {
      const validator = new MGValidator("#form");
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;

      validator.addField('input[name="name"]', {
        rules: [
          { rule: "required", value: undefined, errorMessage: "Имя обязательно" },
          { rule: "minLength", value: 3, errorMessage: "Минимум 3 символа" },
          {
            rule: "latinOrCyrillic",
            value: undefined,
            errorMessage: "Только латиница или русский язык",
          },
        ],
        errorContainer: 'input[name="name"] + p[role="alert"]',
      });

      // Пустое поле
      nameInput.value = "";
      let result = validator.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'input[name="name"]')).toBe(true);

      // Слишком короткое
      nameInput.value = "Ab";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // С цифрами (невалидно)
      nameInput.value = "Иван123";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // Валидное имя на русском
      nameInput.value = "Иван";
      result = validator.validate();
      expect(result.isValid).toBe(true);
      expect(nameInput.classList.contains("is-valid")).toBe(true);

      // Валидное имя на латинице
      nameInput.value = "John";
      result = validator.validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe("email field validation", () => {
    it("validates email with required, email, hasAtSign, and hasDot rules", () => {
      const validator = new MGValidator("#form");
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;

      validator.addField('input[name="email"]', {
        rules: [
          { rule: "required", value: undefined, errorMessage: "Email обязателен" },
          { rule: "email", value: undefined, errorMessage: "Некорректный email" },
          {
            rule: "hasAtSign",
            value: undefined,
            errorMessage: "Email должен содержать @",
          },
          {
            rule: "hasDot",
            value: undefined,
            errorMessage: "Email должен содержать точку (.)",
          },
        ],
        errorContainer: 'input[name="email"] + p[role="alert"]',
      });

      // Пустое поле
      emailInput.value = "";
      let result = validator.validate();
      expect(result.isValid).toBe(false);

      // Без @
      emailInput.value = "testexample.com";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // Без точки
      emailInput.value = "test@examplecom";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // Некорректный формат
      emailInput.value = "notanemail";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // Валидный email
      emailInput.value = "test@example.com";
      result = validator.validate();
      expect(result.isValid).toBe(true);
      expect(emailInput.classList.contains("is-valid")).toBe(true);
    });
  });

  describe("password field validation", () => {
    it("validates password with required and strongPassword rules", () => {
      const validator = new MGValidator("#form");
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;

      validator.addField('input[name="password"]', {
        rules: [
          { rule: "required", value: undefined, errorMessage: "Пароль обязателен" },
          {
            rule: "strongPassword",
            value: undefined,
            errorMessage: "Пароль должен содержать заглавные, строчные буквы и цифры, минимум 8 символов",
          },
        ],
        errorContainer: 'input[name="password"] + p[role="alert"]',
      });

      // Пустое поле
      passwordInput.value = "";
      let result = validator.validate();
      expect(result.isValid).toBe(false);

      // Только строчные буквы
      passwordInput.value = "password";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // Без цифр
      passwordInput.value = "Password";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // Слишком короткий
      passwordInput.value = "Pass1";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // Валидный пароль
      passwordInput.value = "Password123";
      result = validator.validate();
      expect(result.isValid).toBe(true);
      expect(passwordInput.classList.contains("is-valid")).toBe(true);
    });
  });

  describe("confirmPassword field validation", () => {
    it("validates confirmPassword with required and equals rules", () => {
      const validator = new MGValidator("#form");
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      const confirmInput = document.querySelector('input[name="confirmPassword"]') as HTMLInputElement;

      validator
        .addField('input[name="password"]', {
          rules: [{ rule: "required", value: undefined, errorMessage: "Пароль обязателен" }],
          errorContainer: 'input[name="password"] + p[role="alert"]',
        })
        .addField('input[name="confirmPassword"]', {
          rules: [
            { rule: "required", value: undefined, errorMessage: "Подтверждение пароля обязательно" },
            { rule: "equals", value: 'input[name="password"]', errorMessage: "Пароли не совпадают" },
          ],
          errorContainer: 'input[name="confirmPassword"] + p[role="alert"]',
        });

      // Пустое подтверждение
      passwordInput.value = "Password123";
      confirmInput.value = "";
      let result = validator.validate();
      expect(result.isValid).toBe(false);

      // Несовпадающие пароли
      passwordInput.value = "Password123";
      confirmInput.value = "Password456";
      result = validator.validate();
      expect(result.isValid).toBe(false);
      expect(confirmInput.classList.contains("is-invalid")).toBe(true);

      // Совпадающие пароли
      passwordInput.value = "Password123";
      confirmInput.value = "Password123";
      result = validator.validate();
      expect(result.isValid).toBe(true);
      expect(confirmInput.classList.contains("is-valid")).toBe(true);
    });
  });

  describe("phone field validation", () => {
    it("validates phone with required and phone rules", () => {
      const validator = new MGValidator("#form");
      const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;

      validator.addField('input[name="phone"]', {
        rules: [
          { rule: "required", value: undefined, errorMessage: "Телефон обязателен" },
          { rule: "phone", value: undefined, errorMessage: "Телефон должен содержать минимум 10 цифр" },
        ],
        errorContainer: 'input[name="phone"] + p[role="alert"]',
      });

      // Пустое поле
      phoneInput.value = "";
      let result = validator.validate();
      expect(result.isValid).toBe(false);

      // Меньше 10 цифр
      phoneInput.value = "123456789";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // С буквами (невалидно)
      phoneInput.value = "1234567890a";
      result = validator.validate();
      expect(result.isValid).toBe(false);

      // Валидный телефон с форматированием
      phoneInput.value = "+7 (999) 123-45-67";
      result = validator.validate();
      expect(result.isValid).toBe(true);
      expect(phoneInput.classList.contains("is-valid")).toBe(true);

      // Валидный телефон только цифры
      phoneInput.value = "1234567890";
      result = validator.validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe("birthDate field validation", () => {
    it("validates birthDate with required and dateNotFuture rules", () => {
      const validator = new MGValidator("#form");
      const dateInput = document.querySelector('input[name="birthDate"]') as HTMLInputElement;

      validator.addField('input[name="birthDate"]', {
        rules: [
          { rule: "required", value: undefined, errorMessage: "Дата рождения обязательна" },
          { rule: "dateNotFuture", value: undefined, errorMessage: "Дата не должна быть в будущем" },
        ],
        errorContainer: 'input[name="birthDate"] + p[role="alert"]',
      });

      // Пустое поле
      dateInput.value = "";
      let result = validator.validate();
      expect(result.isValid).toBe(false);

      // Дата в будущем
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      dateInput.value = futureDate.toISOString().split("T")[0];
      result = validator.validate();
      expect(result.isValid).toBe(false);
      expect(dateInput.classList.contains("is-invalid")).toBe(true);

      // Валидная дата в прошлом
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 20);
      dateInput.value = pastDate.toISOString().split("T")[0];
      result = validator.validate();
      expect(result.isValid).toBe(true);
      expect(dateInput.classList.contains("is-valid")).toBe(true);

      // Сегодняшняя дата (валидна)
      const today = new Date().toISOString().split("T")[0];
      dateInput.value = today;
      result = validator.validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe("full form validation", () => {
    it("validates all fields together successfully", () => {
      const validator = new MGValidator("#form");
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      const confirmInput = document.querySelector('input[name="confirmPassword"]') as HTMLInputElement;
      const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
      const dateInput = document.querySelector('input[name="birthDate"]') as HTMLInputElement;

      validator
        .addField('input[name="name"]', {
          rules: [
            { rule: "required", value: undefined, errorMessage: "Имя обязательно" },
            { rule: "minLength", value: 3, errorMessage: "Минимум 3 символа" },
            {
              rule: "latinOrCyrillic",
              value: undefined,
              errorMessage: "Только латиница или русский язык",
            },
          ],
          errorContainer: 'input[name="name"] + p[role="alert"]',
        })
        .addField('input[name="email"]', {
          rules: [
            { rule: "required", value: undefined, errorMessage: "Email обязателен" },
            { rule: "email", value: undefined, errorMessage: "Некорректный email" },
          ],
          errorContainer: 'input[name="email"] + p[role="alert"]',
        })
        .addField('input[name="password"]', {
          rules: [
            { rule: "required", value: undefined, errorMessage: "Пароль обязателен" },
            {
              rule: "strongPassword",
              value: undefined,
              errorMessage: "Пароль должен содержать заглавные, строчные буквы и цифры, минимум 8 символов",
            },
          ],
          errorContainer: 'input[name="password"] + p[role="alert"]',
        })
        .addField('input[name="confirmPassword"]', {
          rules: [
            { rule: "required", value: undefined, errorMessage: "Подтверждение пароля обязательно" },
            { rule: "equals", value: 'input[name="password"]', errorMessage: "Пароли не совпадают" },
          ],
          errorContainer: 'input[name="confirmPassword"] + p[role="alert"]',
        })
        .addField('input[name="phone"]', {
          rules: [
            { rule: "required", value: undefined, errorMessage: "Телефон обязателен" },
            { rule: "phone", value: undefined, errorMessage: "Телефон должен содержать минимум 10 цифр" },
          ],
          errorContainer: 'input[name="phone"] + p[role="alert"]',
        })
        .addField('input[name="birthDate"]', {
          rules: [
            { rule: "required", value: undefined, errorMessage: "Дата рождения обязательна" },
            { rule: "dateNotFuture", value: undefined, errorMessage: "Дата не должна быть в будущем" },
          ],
          errorContainer: 'input[name="birthDate"] + p[role="alert"]',
        });

      // Все поля валидны
      nameInput.value = "Иван";
      emailInput.value = "ivan@example.com";
      passwordInput.value = "Password123";
      confirmInput.value = "Password123";
      phoneInput.value = "1234567890";
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 25);
      dateInput.value = pastDate.toISOString().split("T")[0];

      const result = validator.validate();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("fails validation when any field is invalid", () => {
      const validator = new MGValidator("#form");
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;

      validator
        .addField('input[name="name"]', {
          rules: [{ rule: "required", value: undefined, errorMessage: "Имя обязательно" }],
          errorContainer: 'input[name="name"] + p[role="alert"]',
        })
        .addField('input[name="email"]', {
          rules: [{ rule: "required", value: undefined, errorMessage: "Email обязателен" }],
          errorContainer: 'input[name="email"] + p[role="alert"]',
        });

      // Одно поле валидно, другое нет
      nameInput.value = "Иван";
      emailInput.value = "";

      const result = validator.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.field === 'input[name="email"]')).toBe(true);
    });
  });
});

