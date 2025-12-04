import { MGValidator } from './validator';

const validator = new MGValidator('#form');

validator
  .addField('input[name="name"]', {
    rules: [
      { rule: 'required', value: undefined, errorMessage: 'Имя обязательно' },
      { rule: 'minLength', value: 3, errorMessage: 'Минимум 3 символа' },
      { rule: 'latinOrCyrillic', value: undefined, errorMessage: 'Только латиница или русский язык' },
    ],
    errorContainer: 'input[name="name"] + p[role="alert"]',
  })
  .addField('input[name="email"]', {
    rules: [
      { rule: 'required', value: undefined, errorMessage: 'Email обязателен' },
      { rule: 'email', value: undefined, errorMessage: 'Некорректный email' },
      { rule: 'hasAtSign', value: undefined, errorMessage: 'Email должен содержать @' },
    ],
    errorContainer: 'input[name="email"] + p[role="alert"]',
  })
  .onSuccess(() => {
    console.log('✓ Форма успешно прошла валидацию!');
  })
  .onFail((result) => {
    console.log('✗ Ошибки валидации:');
    result.errors.forEach((error) => {
      console.log(`  ${error.field}: ${error.message}`);
    });
  });