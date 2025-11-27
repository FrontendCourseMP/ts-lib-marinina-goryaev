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