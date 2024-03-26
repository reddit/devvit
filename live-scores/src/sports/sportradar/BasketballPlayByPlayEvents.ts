/* 
  Here is a list of the valid event types you can expect to see.
    challengereview - Instant replay (challenge: <outcome>)
    challengetimeout - <team name> challenge timeout
    clearpathfoul - <charged_to> clear path foul (<drawn_by> draws the foul)
    deadball - <given_to> rebound (deadball)
    defaultviolation - <charged_to> violation
    defensivegoaltending - <charged_to> defensive goaltending violation
    delay - <charged_to> delay of game violation
    doublelane - <charged_to> double lane violation
    ejection - <given_to> ejected from the game (<ejection_type>)
    endperiod - End of <nth period/half>
    flagrantone - <charged_to> flagrant 1 (<drawn_by> draws the foul)
    flagranttwo - <charged_to> flagrant 2 (<drawn_by> draws the foul)
    freethrowmade - <taken_by> makes <free_throw_type> free throw <attempt>
    freethrowmiss - <taken_by> misses <free_throw_type> free throw <attempt> (<charged_to> lane_violation)
    jumpball - Jump ball <reason>. <possessor> vs <challenger> (<possession> gains possession)
    jumpballviolation - <charged_to> jump ball violation
    kickball - <charged_to> kicked ball violation
    lane - <charged_to> lane violation
    lineupchange - <team_name> lineup change (<players>)
    offensivefoul - <charged_to> offensive foul (<foul_type_desc>) (<drawn_by> draws the foul)
    officialtimeout - Official timeout
    openinbound - Open inbound <team_name>
    opentip - <home> vs <away> (<possession> gains possession)
    personalfoul - <charged_to> personal foul (<foul_type_desc>) (<drawn_by> draws the foul)
    possession - <possession> gain possession
    rebound - <given_to> <offensive/defensive> rebound
    requestreview - Instant replay (request)
    review - Play review (<reason>, <outcome>)
    shootingfoul - <charged_to> shooting foul (<drawn_by> draws the foul)
    stoppage - Stoppage (<reason>)
    teamtimeout - <team_name> <duration> second timeout
    technicalfoul - <charged_to> technical foul (<foul_type_desc>)
    technicalfoulnonunsportsmanlike - <charged_to> technical foul (<foul_type_desc>)
    threepointmade - <taken_by> makes three point <shot_type_desc> <shot_type> (<assisted_by> assists)
    threepointmiss - <taken_by> misses three point <shot_type_desc> <shot_type> or <blocked_by> blocks <taken_by> three point <shot_type_desc> <shot_type>
    turnover - <charged_to> turnover (turnover_type_desc>)
    tvtimeout - TV Timeout
    twopointmade - <taken_by> makes two point <shot_type_desc> <shot_type> (<assisted_by> assists)
    twopointmiss - <taken_by> misses two point <shot_type_desc> <shot_type> or <blocked_by> blocks <taken_by> two point <shot_type_desc> <shot_type>
*/

import type {
  BasketballGameScoreInfo,
  BasketballGameScoreInfoEvent,
} from './BasketballPlayByPlay.js';

export enum BasketballEventType {
  challengereview = 'challengereview',
  challengetimeout = 'challengetimeout',
  clearpathfoul = 'clearpathfoul',
  deadball = 'deadball',
  defaultviolation = 'defaultviolation',
  defensivegoaltending = 'defensivegoaltending',
  delay = 'delay',
  doublelane = 'doublelane',
  ejection = 'ejection',
  endperiod = 'endperiod',
  flagrantone = 'flagrantone',
  flagranttwo = 'flagranttwo',
  freethrowmade = 'freethrowmade',
  freethrowmiss = 'freethrowmiss',
  jumpball = 'jumpball',
  jumpballviolation = 'jumpballviolation',
  kickball = 'kickball',
  lane = 'lane',
  lineupchange = 'lineupchange',
  offensivefoul = 'offensivefoul',
  officialtimeout = 'officialtimeout',
  openinbound = 'openinbound',
  opentip = 'opentip',
  personalfoul = 'personalfoul',
  possession = 'possession',
  rebound = 'rebound',
  requestreview = 'requestreview',
  review = 'review',
  shootingfoul = 'shootingfoul',
  stoppage = 'stoppage',
  teamtimeout = 'teamtimeout',
  technicalfoul = 'technicalfoul',
  technicalfoulnonunsportsmanlike = 'technicalfoulnonunsportsmanlike',
  threepointmade = 'threepointmade',
  threepointmiss = 'threepointmiss',
  turnover = 'turnover',
  tvtimeout = 'tvtimeout',
  twopointmade = 'twopointmade',
  twopointmiss = 'twopointmiss',
  endofgame = 'endofgame',
  unknown = 'unknown',
}

export function titleForEventType(eventType: string): string {
  switch (eventType) {
    case BasketballEventType.challengereview:
      return `Instant replay (challenge)`;
    case BasketballEventType.challengetimeout:
      return `Challenge timeout`;
    case BasketballEventType.clearpathfoul:
      return `Clear path foul`;
    case BasketballEventType.deadball:
      return `Rebound (deadball)`;
    case BasketballEventType.defaultviolation:
      return `Violation`;
    case BasketballEventType.defensivegoaltending:
      return `Defensive goaltending violation`;
    case BasketballEventType.delay:
      return `Delay of game violation`;
    case BasketballEventType.doublelane:
      return `Double lane violation`;
    case BasketballEventType.ejection:
      return `Ejected from the game`;
    case BasketballEventType.endperiod:
      return `End of period`;
    case BasketballEventType.flagrantone:
      return `Flagrant Foul One`;
    case BasketballEventType.flagranttwo:
      return `Flagrant Foul Two`;
    case BasketballEventType.freethrowmade:
      return `🏀 Free throw made`;
    case BasketballEventType.freethrowmiss:
      return `Free throw miss`;
    case BasketballEventType.jumpball:
      return `Jump ball`;
    case BasketballEventType.jumpballviolation:
      return `Jump ball violation`;
    case BasketballEventType.kickball:
      return `Kicked ball violation`;
    case BasketballEventType.lane:
      return `Lane violation`;
    case BasketballEventType.lineupchange:
      return `Lineup change`;
    case BasketballEventType.offensivefoul:
      return `Offensive foul`;
    case BasketballEventType.officialtimeout:
      return `Official timeout`;
    case BasketballEventType.openinbound:
      return `Open inbound`;
    case BasketballEventType.opentip:
      return `Open tip`;
    case BasketballEventType.personalfoul:
      return `Personal foul`;
    case BasketballEventType.possession:
      return `Possession`;
    case BasketballEventType.rebound:
      return `Rebound`;
    case BasketballEventType.requestreview:
      return `Instant replay (request)`;
    case BasketballEventType.review:
      return `Play review`;
    case BasketballEventType.shootingfoul:
      return `Shooting foul`;
    case BasketballEventType.stoppage:
      return `Stoppage`;
    case BasketballEventType.teamtimeout:
      return `Team timeout`;
    case BasketballEventType.technicalfoul:
      return `Technical foul`;
    case BasketballEventType.technicalfoulnonunsportsmanlike:
      return `Technical foul (non-unsportsmanlike)`;
    case BasketballEventType.threepointmade:
      return `🏀 Three point made`;
    case BasketballEventType.threepointmiss:
      return `Three point miss`;
    case BasketballEventType.turnover:
      return `Turnover`;
    case BasketballEventType.tvtimeout:
      return `📺 TV Timeout`;
    case BasketballEventType.twopointmade:
      return `🏀 Two point made`;
    case BasketballEventType.twopointmiss:
      return `Two point miss`;
    case BasketballEventType.endofgame:
      return `Game has ended`;
    default:
      return 'Latest Update';
  }
}

export function filteredBasketballEvents(
  events: BasketballGameScoreInfoEvent[]
): BasketballGameScoreInfoEvent[] {
  const includedEventTypes: String[] = [
    BasketballEventType.challengereview,
    // BasketballEventType.challengetimeout,
    BasketballEventType.clearpathfoul,
    // BasketballEventType.deadball,
    // BasketballEventType.defaultviolation,
    // BasketballEventType.defensivegoaltending,
    // BasketballEventType.delay,
    // BasketballEventType.doublelane,
    BasketballEventType.ejection,
    BasketballEventType.endperiod,
    BasketballEventType.flagrantone,
    BasketballEventType.flagranttwo,
    BasketballEventType.freethrowmade,
    // BasketballEventType.freethrowmiss,
    // BasketballEventType.jumpball,
    // BasketballEventType.jumpballviolation,
    // BasketballEventType.kickball,
    // BasketballEventType.lane,
    BasketballEventType.lineupchange,
    BasketballEventType.offensivefoul,
    // BasketballEventType.officialtimeout,
    // BasketballEventType.openinbound,
    BasketballEventType.opentip,
    BasketballEventType.personalfoul,
    // BasketballEventType.possession,
    // BasketballEventType.rebound,
    // BasketballEventType.requestreview,
    // BasketballEventType.review,
    BasketballEventType.shootingfoul,
    // BasketballEventType.stoppage,
    BasketballEventType.teamtimeout,
    BasketballEventType.technicalfoul,
    BasketballEventType.technicalfoulnonunsportsmanlike,
    BasketballEventType.threepointmade,
    // BasketballEventType.threepointmiss,
    // BasketballEventType.turnover,
    BasketballEventType.tvtimeout,
    BasketballEventType.twopointmade,
    // BasketballEventType.twopointmiss,
  ];

  return events.filter((event: BasketballGameScoreInfoEvent) => {
    return includedEventTypes.includes(event.event_type);
  });
}

export function totalEventsCount(info: BasketballGameScoreInfo): number {
  let sum = 0;
  if (info.periods) {
    for (let i = 0; i < info.periods.length; i++) {
      sum += info.periods[i].events.length;
    }
  }
  return sum;
}

export function getEventAtIndex(
  index: number,
  gameInfo: BasketballGameScoreInfo
): BasketballGameScoreInfoEvent | undefined {
  if (!gameInfo.periods || gameInfo.periods.length === 0) {
    return;
  }
  const allEvents = gameInfo.periods.map((period) => period.events).flat();
  if (index < 0 || index >= allEvents.length) {
    return;
  }
  return allEvents[index];
}
