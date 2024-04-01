import { ALL_ICON_NAMES, ParagraphField, StringField, SelectField } from '@devvit/public-api';
import { boolean, z } from 'zod';
import { Devvit } from '@devvit/public-api';

const color = z
  .object({
    light: z.string().min(1),
    dark: z.string().min(1).nullable(),
  })
  .strict();

/**
 * FormField types are not exhaustive! Refer to types in
 * @devvit/public-api for all options.
 */

const formFieldString = z
  .object({
    type: z.literal('string'),
    name: z.string().min(1),
    label: z.string().min(1),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
    minLength: z.string().optional(),
    maxLength: z.string().optional(),
  })
  .strict() satisfies z.ZodType<StringField>;

const formFieldParagraph = z
  .object({
    type: z.literal('paragraph'),
    name: z.string().min(1),
    label: z.string().min(1),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
  })
  .strict() satisfies z.ZodType<ParagraphField>;

const formFieldOptions = z
  .object({
    name: z.string().min(1),
    label: z.string().min(1),
    type: z.literal('select'),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
    options: z.array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      })
    ),
  })
  .strict() satisfies z.ZodType<SelectField>;

const formField = z.union([formFieldString, formFieldParagraph, formFieldOptions]);

// Generic structure in case we want to handle rich text eventually
export const richTextBody = z.array(
  z
    .object({
      type: z.enum(['paragraph']),
      children: z.array(
        z.object({
          type: z.literal('text'),
          text: z.string().min(1),
          weight: z.enum(['bold', 'regular']).optional() satisfies z.ZodType<
            Devvit.Blocks.TextProps['weight']
          >,
          size: z
            .enum(['xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge'])
            .optional() satisfies z.ZodType<Devvit.Blocks.TextProps['size']>,
        })
      ),
    })
    .strict()
);

export class Schema {
  static configSchema = z.object({});

  static commonPinAttributes = z
    .object({
      id: z.string().min(1),
      pinTitle: z.string().max(20),
      pinIcon: z.enum(ALL_ICON_NAMES),
      enabled: z.boolean(),
    })
    .strict();

  static linkPin = z
    .object({
      type: z.literal('link'),
      url: z.string().nullable(),
    })
    .strict()
    .merge(Schema.commonPinAttributes);

  static eventsPin = z
    .object({
      type: z.literal('events'),
      header: z.string().min(1),
      subheader: z.string(),
      events: z.array(
        z
          .object({
            id: z.string().min(1),
            title: z.string().min(1).max(500),
            description: z.string().max(500),
            startDate: z.string().min(1),
            startTime: z.string().min(1),
            url: z.string().nullable(),
            enableReminders: z.boolean(),
            subscribers: z.array(z.string()),
          })
          .strict()
      ),
    })
    .strict()
    .merge(Schema.commonPinAttributes);

  static wikiPin = z
    .object({
      type: z.literal('wiki'),
      header: z.string().min(1),
      subheader: z.string(),
      items: z.array(
        z
          .object({
            id: z.string().min(1),
            title: z.string().min(1).max(100),
            description: z.string().max(500),
            url: z.string().nullable(),
          })
          .strict()
      ),
    })
    .strict()
    .merge(Schema.commonPinAttributes);

  static pagePin = z
    .object({
      type: z.literal('page'),
      header: z.string().min(1),
      subheader: z.string(),
      body: richTextBody,
    })
    .strict()
    .merge(Schema.commonPinAttributes);

  static flairPin = z
    .object({
      type: z.literal('flair'),
      header: z.string().min(1),
      subheader: z.string(),
      body: richTextBody,
      includeLink: z.boolean(),
      url: z.string().nullable(),
      formTitle: z.string().min(1),
      image: z.string(),
    })
    .strict()
    .merge(Schema.commonPinAttributes);

  static formPin = z
    .object({
      type: z.literal('form'),
      header: z.string().min(1),
      subheader: z.string(),
      /** Falls back to the header if not provided */
      formTitle: z.string(),
      /** This is what is appended into any messages sent on form submission */
      formName: z.string().min(1),
      formDescription: z.string(),
      formAcceptLabel: z.string(),
      formCancelLabel: z.string(),
      action: z.enum(['sendToMods', 'sendToEmails']),
      /** Renders the form on a dedicated page before popping the form modal. */
      dedicatedPage: z.boolean(),
      /** Specific information to form actions. For example, sendToEmails would store an array of emails here. */
      actionMeta: z.record(z.string(), z.any()).nullable(),
      items: z.array(formField),
    })
    .strict()
    .merge(Schema.commonPinAttributes);

  static pin = z.union([
    Schema.linkPin,
    Schema.eventsPin,
    Schema.wikiPin,
    Schema.pagePin,
    Schema.flairPin,
    Schema.formPin,
  ]);

  static pinPostInstance = z
    .object({
      status: z.enum(['draft', 'live']),
      /** Controls showing the border of the app. */
      showBorder: z.boolean(),
      url: z.string().nullable(),
      createdAt: z.string().datetime(),
      createdBy: z.string().min(1),
      owners: z.array(z.string()).min(1),
      featuredImage: z.string().min(1),
      primaryColor: color,
      /** This is the title of the post on Reddit */
      title: z.string().min(1),
      /** This is the header inside of the custom post */
      header: z.string().min(1),
      subheader: z.string(),
      pins: z.array(Schema.pin),
    })
    .strict();
}
