// The body of POST requests sent to the app's server when validating a setting value.
export type SettingsValidationRequest<ValueType> = {
  /** The value to validate. */
  value: ValueType | undefined;
  /** Whether the form is editing existing settings */
  isEditing: boolean;
};

// The response expected from the app's server when validating a setting value.
export type SettingsValidationResponse = {
  /** If the validation was successful, this will be true. */
  success: boolean;
  /** If the validation failed, this will contain the error message. */
  error?: string;
};
