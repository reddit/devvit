import type {
  AddSubredditRuleRequest,
  SubredditAboutRulesResponse_SubredditRule,
  UpdateSubredditRuleRequest,
} from '@devvit/protos/json/devvit/plugin/redditapi/subreddits/subreddits_msg.js';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';

import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { getRedditApiPlugins } from '../plugin.js';

type SubredditRuleProto = SubredditAboutRulesResponse_SubredditRule;

function isKind(value: string | undefined): value is 'all' | 'link' | 'comment' {
  return value !== undefined && (value === 'all' || value === 'link' || value === 'comment');
}

/**
 * Options for creating a new subreddit rule.
 */
export type CreateRuleOptions = Omit<AddSubredditRuleRequest, 'r' | 'kind' | 'violationReason'> & {
  kind: 'all' | 'link' | 'comment';
  violationReason?: string;
};

/**
 * New values for an existing rule. All fields are optional. If a field is not provided, the existing value will not be changed.
 */
export type UpdateRuleOptions = Partial<Omit<UpdateSubredditRuleRequest, 'r' | 'oldShortName'>> & {
  kind?: 'all' | 'link' | 'comment';
};

export class Rule {
  #shortName: string;
  #description: string;
  #kind: 'all' | 'link' | 'comment';
  #violationReason: string;
  #priority: number;
  #createdUtc: number;
  #descriptionHtml: string | undefined;
  #subredditName: string;

  constructor(ruleData: SubredditRuleProto, subredditName: string) {
    makeGettersEnumerable(this);

    const shortName = ruleData.shortName;
    const description = ruleData.description;
    const priority = ruleData.priority;
    const createdUtc = ruleData.createdUtc;
    const descriptionHtml = ruleData.descriptionHtml;

    if (!isKind(ruleData.kind)) {
      throw new Error(`Invalid kind: ${ruleData.kind}`);
    }

    assertNonNull(shortName, 'Subreddit rule is missing shortName');
    assertNonNull(description, 'Subreddit rule is missing description');
    assertNonNull(priority, 'Subreddit rule is missing priority');
    assertNonNull(createdUtc, 'Subreddit rule is missing createdUtc');
    assertNonNull(descriptionHtml, 'Subreddit rule is missing descriptionHtml');

    this.#shortName = shortName;
    this.#description = description;
    this.#kind = ruleData.kind;
    this.#violationReason = ruleData.violationReason ?? shortName;
    this.#priority = priority;
    this.#createdUtc = createdUtc;
    this.#descriptionHtml = descriptionHtml;
    this.#subredditName = subredditName.startsWith('r/') ? subredditName.slice(2) : subredditName;
  }

  /**
   * The name for the rule.
   */
  get shortName(): string {
    return this.#shortName;
  }

  /**
   * The full description of the rule. This appears on your subreddit's sidebar.
   */
  get description(): string {
    return this.#description;
  }

  /**
   * Which Reddit objects this rule applies to. One of "all", "link" (AKA posts), "comment".
   */
  get kind(): 'all' | 'link' | 'comment' {
    return this.#kind;
  }

  /**
   * Text to show users when reporting content due to this rule. Defaults to the shortName.
   */
  get violationReason(): string {
    return this.#violationReason;
  }

  /**
   * The zero-indexed rank of the rule on the subreddit sidebar. Lower numbers appear on top.
   */
  get priority(): number {
    return this.#priority;
  }

  /**
   * The Unix timestamp of when the rule was created.
   */
  get createdUtc(): number {
    return this.#createdUtc;
  }

  get descriptionHtml(): string | undefined {
    return this.#descriptionHtml;
  }

  /**
   * The name (without r/ prefix) of the subreddit the rule belongs to.
   */
  get subredditName(): string {
    return this.#subredditName;
  }

  toJSON(): Pick<
    Rule,
    | 'shortName'
    | 'description'
    | 'kind'
    | 'violationReason'
    | 'priority'
    | 'createdUtc'
    | 'subredditName'
  > & { descriptionHtml?: string } {
    return {
      shortName: this.shortName,
      description: this.description,
      kind: this.kind,
      violationReason: this.violationReason,
      priority: this.priority,
      createdUtc: this.createdUtc,
      subredditName: this.subredditName,
      ...(this.descriptionHtml !== undefined && { descriptionHtml: this.descriptionHtml }),
    };
  }

  /**
   * Update an existing rule.
   *
   * @param options - New values for an existing rule. All fields are optional. If a field is not provided, the existing value will not be changed.
   * @param options.shortName - New name for the rule. The rule name must be unique within this subreddit.
   * @param options.description - New full description of the rule.
   * @param options.kind - Which Reddit objects this rule should apply to now. One of "all", "link", "comment".
   * @param options.violationReason - New text to show users when reporting content due to this rule.
   *   To reset violationReason to the default value of shortName, pass the shortName or an empty string.
   */
  async update(options: Readonly<UpdateRuleOptions>): Promise<void> {
    const client = getRedditApiPlugins().Subreddits;

    await client.UpdateSubredditRule(
      {
        r: this.subredditName,
        oldShortName: this.shortName,
        shortName: options.shortName ?? this.shortName, // The shortName is required even if it's not changing
        description: options.description ?? '', // Leaving the description empty will not update it
        kind: options.kind ?? this.kind, // The kind is required even if it's not changing
        // The Reddit API doesn't provide a way to reset the violation reason, so we treat an explicit empty string as a signal to reset it to the shortName
        violationReason:
          options.violationReason === '' ? this.shortName : (options.violationReason ?? ''),
      },
      context.metadata
    );
  }

  async delete(): Promise<void> {
    return Rule.delete(this.subredditName, this.shortName);
  }

  static async getRules(subredditName: string): Promise<Rule[]> {
    const client = getRedditApiPlugins().Subreddits;

    const response = await client.SubredditAboutRules(
      { subreddit: subredditName },
      context.metadata
    );

    return (response.rules ?? []).map((ruleData) => new Rule(ruleData, subredditName));
  }

  static async createRule(
    subredditName: string,
    options: Readonly<CreateRuleOptions>
  ): Promise<void> {
    if (options.shortName === '') {
      throw new Error('Short name cannot be empty');
    }
    if (options.description === '') {
      throw new Error('Description cannot be empty');
    }

    const client = getRedditApiPlugins().Subreddits;

    await client.AddSubredditRule(
      {
        r: subredditName,
        description: options.description,
        kind: options.kind,
        shortName: options.shortName,
        violationReason: options.violationReason ?? '',
      },
      context.metadata
    );
  }

  static async reorderRules(subredditName: string, rules: Rule[]): Promise<void> {
    const client = getRedditApiPlugins().Subreddits;

    await client.ReorderSubredditRules(
      {
        r: subredditName,
        newRuleOrder: rules.map((rule) => rule.shortName).join(','),
      },
      context.metadata
    );
  }

  static async delete(subredditName: string, shortName: string): Promise<void> {
    const client = getRedditApiPlugins().Subreddits;

    await client.RemoveSubredditRule(
      {
        r: subredditName,
        shortName,
      },
      context.metadata
    );
  }
}
