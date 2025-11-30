export type ValidationRule = {
    rule: string;
    value: any;
    errorMessage: string;
}

export type FieldConfig = {
    rules: ValidationRule[];
    errorContainer: string | HTMLElement;
}

export type ValidationResult = {
  isValid: boolean;                
  errors: { field: string; message: string }[]; 
}

export type ValidationConfig = {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  focusInvalidField?: boolean;
  lockForm?: boolean;
  errorFieldCssClass?: string;
  errorLabelCssClass?: string;
  successFieldCssClass?: string;
  successLabelCssClass?: string;
};

export type FormFields = {
  [fieldName: string]: FieldConfig;
};

export type Validator = {
  addField: (field: string, config: FieldConfig) => void;
  validate: () => ValidationResult;
};
