import { deleteFromRawEnvContent, upsertToRawEnvContent } from './dotEnvOperations.js';

describe('upsertToRawEnvContent', () => {
  it('should add a new environment variable if it does not exist', () => {
    const rawEnvContent = 'EXISTING_VAR=existing_value';
    const result = upsertToRawEnvContent('NEW_VAR', 'new_value', rawEnvContent);

    expect(result).toContain('EXISTING_VAR=existing_value');
    expect(result).toContain('NEW_VAR=new_value');
  });

  it('should overwrite an existing environment variable', () => {
    const rawEnvContent = 'EXISTING_VAR=old_value';
    const result = upsertToRawEnvContent('EXISTING_VAR', 'new_value', rawEnvContent);

    expect(result).toContain('EXISTING_VAR=new_value');
    expect(result).not.toContain('EXISTING_VAR=old_value');
  });

  it('should handle an empty raw environment content', () => {
    const rawEnvContent = '';
    const result = upsertToRawEnvContent('NEW_VAR', 'new_value', rawEnvContent);

    expect(result).toBe('NEW_VAR=new_value\n');
  });

  it('should preserve other environment variables when adding a new one', () => {
    const rawEnvContent = 'VAR1=value1\nVAR2=value2';
    const result = upsertToRawEnvContent('NEW_VAR', 'new_value', rawEnvContent);

    expect(result).toContain('VAR1=value1');
    expect(result).toContain('VAR2=value2');
    expect(result).toContain('NEW_VAR=new_value');
  });

  it('should handle special characters in variable values', () => {
    const rawEnvContent = 'EXISTING_VAR=value';
    const result = upsertToRawEnvContent(
      'NEW_VAR',
      'value_with_special_chars!@#$%^&*()',
      rawEnvContent
    );

    expect(result).toContain('NEW_VAR=value_with_special_chars!@#$%^&*()');
  });

  it('should handle variables with no value', () => {
    const rawEnvContent = 'EXISTING_VAR=value';
    const result = upsertToRawEnvContent('NEW_VAR', '', rawEnvContent);

    expect(result).toContain('NEW_VAR=');
  });
});

describe('deleteFromRawEnvContent', () => {
  it('should remove an existing environment variable', () => {
    const rawEnvContent = 'VAR1=value1\nVAR2=value2\nVAR3=value3';
    const result = deleteFromRawEnvContent('VAR2', rawEnvContent);

    expect(result).toContain('VAR1=value1');
    expect(result).toContain('VAR3=value3');
    expect(result).not.toContain('VAR2=value2');
  });

  it('should handle non-existing environment variables gracefully', () => {
    const rawEnvContent = 'VAR1=value1\nVAR2=value2';
    const result = deleteFromRawEnvContent('VAR3', rawEnvContent);

    expect(result).toContain('VAR1=value1');
    expect(result).toContain('VAR2=value2');
    expect(result).not.toContain('VAR3=');
  });

  it('should handle an empty raw environment content', () => {
    const rawEnvContent = '';
    const result = deleteFromRawEnvContent('VAR1', rawEnvContent);

    expect(result).toBe('');
  });

  it('should handle variables with no value', () => {
    const rawEnvContent = 'VAR1=value1\nVAR2=\nVAR3=value3';
    const result = deleteFromRawEnvContent('VAR2', rawEnvContent);

    expect(result).toContain('VAR1=value1');
    expect(result).toContain('VAR3=value3');
    expect(result).not.toContain('VAR2=');
  });

  it('should handle special characters in variable names', () => {
    const rawEnvContent = 'VAR1=value1\nSPECIAL_VAR!@#=value2\nVAR3=value3';
    const result = deleteFromRawEnvContent('SPECIAL_VAR!@#', rawEnvContent);

    expect(result).toContain('VAR1=value1');
    expect(result).toContain('VAR3=value3');
    expect(result).not.toContain('SPECIAL_VAR!@#=value2');
  });
});
