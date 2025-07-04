export const demoNflGame03: unknown = {
  id: 'demo-nfl-game-03',
  status: 'inprogress',
  scheduled: '2024-01-07T01:15:00+00:00',
  entry_mode: 'LDE',
  clock: '9:09',
  quarter: 2,
  sr_id: 'sr:match:41209665',
  game_type: 'regular',
  conference_game: true,
  weather: {
    condition: 'Mist',
    humidity: 92,
    temp: 35,
    wind: {
      speed: 2,
      direction: 'N',
    },
  },
  coin_toss: [
    {
      home: {
        outcome: 'lost',
        decision: 'receive',
      },
      away: {
        outcome: 'won',
        decision: 'defer',
      },
      quarter: 1,
    },
  ],
  summary: {
    season: {
      id: 'a538d200-e916-4272-aa07-b486094a1668',
      year: 2023,
      type: 'REG',
      name: 'REG',
    },
    week: {
      id: '7723bce4-a683-4152-b95d-42bce6e98d9c',
      sequence: 18,
      title: '18',
    },
    venue: {
      id: '6ed18563-53e0-46c2-a91d-12d73a16456d',
      name: 'Lucas Oil Stadium',
      city: 'Indianapolis',
      state: 'IN',
      country: 'USA',
      zip: '46225',
      address: '500 South Capitol Avenue',
      capacity: 67000,
      surface: 'artificial',
      roof_type: 'retractable_dome',
      sr_id: 'sr:venue:8185',
      location: {
        lat: '39.760008',
        lng: '-86.163906',
      },
    },
    home: {
      id: '82cf9565-6eb9-4f01-bdbd-5aa0d472fcd9',
      name: 'Colts',
      market: 'Indianapolis',
      alias: 'IND',
      sr_id: 'sr:competitor:4421',
      used_timeouts: 0,
      remaining_timeouts: 3,
      points: 3,
      used_challenges: 0,
      remaining_challenges: 2,
    },
    away: {
      id: '82d2d380-3834-4938-835f-aec541e5ece7',
      name: 'Texans',
      market: 'Houston',
      alias: 'HOU',
      sr_id: 'sr:competitor:4324',
      used_timeouts: 0,
      remaining_timeouts: 3,
      points: 7,
      used_challenges: 0,
      remaining_challenges: 2,
    },
  },
  situation: {
    clock: '9:01',
    down: 3,
    yfd: 7,
    possession: {
      id: '82d2d380-3834-4938-835f-aec541e5ece7',
      name: 'Texans',
      market: 'Houston',
      alias: 'HOU',
      sr_id: 'sr:competitor:4324',
    },
    location: {
      id: '82d2d380-3834-4938-835f-aec541e5ece7',
      name: 'Texans',
      market: 'Houston',
      alias: 'HOU',
      sr_id: 'sr:competitor:4324',
      yardline: 44,
    },
  },
  last_event: {
    type: 'play',
    id: '39eab640-ad01-11ee-b18e-11f7316c1a9e',
    sequence: 1704593164115,
    clock: '9:09',
    home_points: 3,
    away_points: 7,
    play_type: 'rush',
    wall_clock: '2024-01-07T02:05:55+00:00',
    description:
      'D.Singletary rushed up the middle to HOU 44 for 3 yards. Tackled by G.Stewart, Z.Franklin at HOU 44.',
    fake_punt: false,
    fake_field_goal: false,
    screen_pass: false,
    play_action: false,
    run_pass_option: false,
    created_at: '2024-01-07T02:06:04+00:00',
    updated_at: '2024-01-07T02:06:29+00:00',
    start_situation: {
      clock: '9:09',
      down: 2,
      yfd: 10,
      possession: {
        id: '82d2d380-3834-4938-835f-aec541e5ece7',
        name: 'Texans',
        market: 'Houston',
        alias: 'HOU',
        sr_id: 'sr:competitor:4324',
      },
      location: {
        id: '82d2d380-3834-4938-835f-aec541e5ece7',
        name: 'Texans',
        market: 'Houston',
        alias: 'HOU',
        sr_id: 'sr:competitor:4324',
        yardline: 41,
      },
    },
    end_situation: {
      clock: '9:01',
      down: 3,
      yfd: 7,
      possession: {
        id: '82d2d380-3834-4938-835f-aec541e5ece7',
        name: 'Texans',
        market: 'Houston',
        alias: 'HOU',
        sr_id: 'sr:competitor:4324',
      },
      location: {
        id: '82d2d380-3834-4938-835f-aec541e5ece7',
        name: 'Texans',
        market: 'Houston',
        alias: 'HOU',
        sr_id: 'sr:competitor:4324',
        yardline: 44,
      },
    },
    statistics: [
      {
        stat_type: 'rush',
        attempt: 1,
        yards: 3,
        firstdown: 0,
        inside_20: 0,
        goaltogo: 0,
        broken_tackles: 0,
        kneel_down: 0,
        scramble: 0,
        player: {
          id: 'a961b0d4-5d7c-438e-90f0-2e1fa09f6c89',
          name: 'Devin Singletary',
          jersey: '26',
          position: 'RB',
          sr_id: 'sr:player:1202676',
        },
        team: {
          id: '82d2d380-3834-4938-835f-aec541e5ece7',
          name: 'Texans',
          market: 'Houston',
          alias: 'HOU',
          sr_id: 'sr:competitor:4324',
        },
      },
      {
        stat_type: 'defense',
        ast_tackle: 1,
        category: 'defense',
        def_target: 0,
        def_comp: 0,
        blitz: 0,
        hurry: 0,
        knockdown: 0,
        batted_pass: 0,
        player: {
          id: 'b0ad00bc-3b30-41ce-8892-f8105e0943e2',
          name: 'Zaire Franklin',
          jersey: '44',
          position: 'LB',
          sr_id: 'sr:player:1223736',
        },
        team: {
          id: '82cf9565-6eb9-4f01-bdbd-5aa0d472fcd9',
          name: 'Colts',
          market: 'Indianapolis',
          alias: 'IND',
          sr_id: 'sr:competitor:4421',
        },
      },
      {
        stat_type: 'defense',
        tackle: 1,
        category: 'defense',
        def_target: 0,
        def_comp: 0,
        blitz: 0,
        hurry: 0,
        knockdown: 0,
        batted_pass: 0,
        player: {
          id: 'fae57441-a198-4674-8a37-401b64d17961',
          name: 'Grover Stewart',
          jersey: '90',
          position: 'DT',
          sr_id: 'sr:player:1130047',
        },
        team: {
          id: '82cf9565-6eb9-4f01-bdbd-5aa0d472fcd9',
          name: 'Colts',
          market: 'Indianapolis',
          alias: 'IND',
          sr_id: 'sr:competitor:4421',
        },
      },
    ],
    details: [
      {
        category: 'rush',
        description: 'D.Singletary rushed up the middle to HOU 44 for 3 yards.',
        sequence: 0,
        direction: 'up the middle',
        yards: 3,
        result: 'tackled',
        start_location: {
          alias: 'HOU',
          yardline: 41,
        },
        end_location: {
          alias: 'HOU',
          yardline: 44,
        },
        players: [
          {
            id: 'a961b0d4-5d7c-438e-90f0-2e1fa09f6c89',
            name: 'Devin Singletary',
            jersey: '26',
            position: 'RB',
            sr_id: 'sr:player:1202676',
            role: 'rush',
          },
        ],
      },
      {
        category: 'tackle',
        description: 'Tackled by G.Stewart, Z.Franklin at HOU 44.',
        sequence: 1,
        start_location: {
          alias: 'HOU',
          yardline: 44,
        },
        end_location: {
          alias: 'HOU',
          yardline: 44,
        },
        players: [
          {
            id: 'fae57441-a198-4674-8a37-401b64d17961',
            name: 'Grover Stewart',
            jersey: '90',
            position: 'DT',
            sr_id: 'sr:player:1130047',
            role: 'tackle',
          },
          {
            id: 'b0ad00bc-3b30-41ce-8892-f8105e0943e2',
            name: 'Zaire Franklin',
            jersey: '44',
            position: 'LB',
            sr_id: 'sr:player:1223736',
            role: 'ast_tackle',
          },
        ],
      },
    ],
  },
  scoring: [
    {
      period_type: 'quarter',
      id: '3783d9e7-4fb1-44ed-823b-d98f3f1642d3',
      number: 1,
      sequence: 1,
      home_points: 3,
      away_points: 7,
    },
    {
      period_type: 'quarter',
      id: '2b6d464b-9d52-409f-a8b3-d10f4c81fc33',
      number: 2,
      sequence: 2,
      home_points: 0,
      away_points: 0,
    },
  ],
};
