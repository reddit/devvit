export type TeamInfo = {
  color: string;
  logo: string;
  name: string;
  city: string;
};

export const NBA_TEAM_INFO = {
  atl: {
    color: '#E03A3E',
    logo: 'basketball/nba/nba-atl.png',
    name: 'Hawks',
    city: 'Atlanta',
  },
  bos: {
    color: '#008348',
    logo: 'basketball/nba/nba-bos.png',
    name: 'Celtics',
    city: 'Boston',
  },
  bkn: {
    color: '#000000',
    logo: 'basketball/nba/nba-bkn.png',
    name: 'Nets',
    city: 'Brooklyn',
  },
  cha: {
    color: '#1D1160',
    logo: 'basketball/nba/nba-cha.png',
    name: 'Hornets',
    city: 'Charlotte',
  },
  chi: {
    color: '#CE1141',
    logo: 'basketball/nba/nba-chi.png',
    name: 'Bulls',
    city: 'Chicago',
  },
  cle: {
    color: '#860038',
    logo: 'basketball/nba/nba-cle.png',
    name: 'Cavaliers',
    city: 'Cleveland',
  },
  dal: {
    color: '#00538C',
    logo: 'basketball/nba/nba-dal.png',
    name: 'Mavericks',
    city: 'Dallas',
  },
  den: {
    color: '#0E2240',
    logo: 'basketball/nba/nba-den.png',
    name: 'Nuggets',
    city: 'Denver',
  },
  det: {
    color: '#C8102E',
    logo: 'basketball/nba/nba-det.png',
    name: 'Pistons',
    city: 'Detroit',
  },
  gs: {
    color: '#1D428A',
    logo: 'basketball/nba/nba-gs.png',
    name: 'Warriors',
    city: 'Golden State',
  },
  hou: {
    color: '#CE1141',
    logo: 'basketball/nba/nba-hou.png',
    name: 'Rockets',
    city: 'Houston',
  },
  ind: {
    color: '#FDBB30',
    logo: 'basketball/nba/nba-ind.png',
    name: 'Pacers',
    city: 'Indianapolis',
  },
  lac: {
    color: '#C8102E',
    logo: 'basketball/nba/nba-lac.png',
    name: 'Clippers',
    city: 'Los Angeles',
  },
  lal: {
    color: '#552583',
    logo: 'basketball/nba/nba-lal.png',
    name: 'Lakers',
    city: 'Los Angeles',
  },
  mem: {
    color: '#5D76A9',
    logo: 'basketball/nba/nba-mem.png',
    name: 'Grizzlies',
    city: 'Memphis',
  },
  mia: {
    color: '#98002E',
    logo: 'basketball/nba/nba-mia.png',
    name: 'Heat',
    city: 'Miami',
  },
  mil: {
    color: '#00471B',
    logo: 'basketball/nba/nba-mil.png',
    name: 'Bucks',
    city: 'Milwaukee',
  },
  min: {
    color: '#236192',
    logo: 'basketball/nba/nba-min.png',
    name: 'Timberwolves',
    city: 'Minnesota',
  },
  no: {
    color: '#0C2340',
    logo: 'basketball/nba/nba-no.png',
    name: 'Pelicans',
    city: 'New Orleans',
  },
  ny: {
    color: '#006BB6',
    logo: 'basketball/nba/nba-ny.png',
    name: 'Knicks',
    city: 'New York',
  },
  okc: {
    color: '#007AC1',
    logo: 'basketball/nba/nba-okc.png',
    name: 'Thunder',
    city: 'Oklahoma City',
  },
  orl: {
    color: '#0077C0',
    logo: 'basketball/nba/nba-orl.png',
    name: 'Magic',
    city: 'Orlando',
  },
  phi: {
    color: '#006BB6',
    logo: 'basketball/nba/nba-phi.png',
    name: '76ers',
    city: 'Philadelphia',
  },
  phx: {
    color: '#1D1160',
    logo: 'basketball/nba/nba-phx.png',
    name: 'Suns',
    city: 'Phoenix',
  },
  por: {
    color: '#E03A3E',
    logo: 'basketball/nba/nba-por.png',
    name: 'Trailblazers',
    city: 'Portland',
  },
  sac: {
    color: '#5A2D81',
    logo: 'basketball/nba/nba-sac.png',
    name: 'Kings',
    city: 'Sacramento',
  },
  sa: {
    color: '#C4CED4',
    logo: 'basketball/nba/nba-sa.png',
    name: 'Spurs',
    city: 'San Antonio',
  },
  tor: {
    color: '#CE1141',
    logo: 'basketball/nba/nba-tor.png',
    name: 'Raptors',
    city: 'Toronto',
  },
  uth: {
    color: '#002B5C',
    logo: 'basketball/nba/nba-uth.png',
    name: 'Jazz',
    city: 'Utah',
  },
  was: {
    color: '#002B5C',
    logo: 'basketball/nba/nba-was.png',
    name: 'Wizards',
    city: 'Washington',
  },
} satisfies Record<string, TeamInfo>;

export type NBATeamCode = keyof typeof NBA_TEAM_INFO;

export const THEME = {
  // Pulled from here: packages/ui-renderer/library/src/blocks/attributes.ts
  padding: {
    xsmall: 4,
    small: 8,
    medium: 16,
    large: 32,
  },
} as const;
