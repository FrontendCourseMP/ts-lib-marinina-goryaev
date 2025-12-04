import { MGValidator } from "./validator";

const validator = new MGValidator("#form");

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
  })
  .onSuccess(() => {
    console.log("✓ Форма успешно прошла валидацию!");
  })
  .onFail((result) => {
    console.log("✗ Ошибки валидации:");
    result.errors.forEach((error) => {
      console.log(`  ${error.field}: ${error.message}`);
    });
  })

  .addField('input[name="password"]', {
    rules: [
      { rule: "required", value: undefined, errorMessage: "Пароль обязателен" },
      { rule: "strongPassword", value: undefined, errorMessage: "Пароль должен содержать заглавные, строчные буквы и цифры, минимум 8 символов" },
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
  })
