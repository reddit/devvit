import type {
  BooleanField,
  Form,
  FormField,
  FormFieldGroup,
  FormFunction,
  ImageField,
  NumberField,
  ParagraphField,
  SelectField,
  StringField,
} from './form.js';

export type Dispatch<A> = (value: A) => void;

export type FormToFormValues<T extends Form | FormFunction = Form | FormFunction> =
  FormFieldsToFormValues<(T extends FormFunction ? ReturnType<T> : T)['fields']>;

/**
 * Input is a FormField[], output is a
 * {fieldNameA: fieldTypeA, fieldNameB: fieldTypeB}.
 */
type FormFieldsToFormValues<T extends readonly FormField[]> = T extends readonly [
  infer Field extends FormField,
  ...infer Rest extends FormField[],
]
  ? FormFieldToFormValue<Field> & FormFieldsToFormValues<Rest>
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { [key: string]: any }; // possibly empty but more likely couldn't infer.

/** Input is a FormField, output is a {fieldName: fieldType}. */
type FormFieldToFormValue<T extends FormField> = T extends BooleanField
  ? { [_ in T['name']]: boolean }
  : T extends ImageField | ParagraphField | StringField
    ? FormFieldToRequiredFormValue<T, string>
    : T extends NumberField
      ? FormFieldToRequiredFormValue<T, number>
      : T extends SelectField
        ? { [_ in T['name']]: string[] }
        : T extends FormFieldGroup
          ? FormFieldsToFormValues<T['fields']>
          : never;

/**
 * Input is a FormField, output is a {fieldName: fieldType} or
 * {fieldName?: fieldType}.
 */
type FormFieldToRequiredFormValue<
  T extends ImageField | ParagraphField | StringField | NumberField,
  V,
> = T extends { required: true } | { defaultValue: boolean | number | string }
  ? { [_ in T['name']]: V }
  : { [_ in T['name']]?: V };
