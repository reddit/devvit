export const demoEpl1: any = JSON.parse(
  `{
    "generated_at": "2023-10-24T16:19:49+00:00",
    "sport_event": {
        "id": "sr:sport_event:41763009",
        "start_time": "2023-10-21T14:00:00+00:00",
        "start_time_confirmed": true,
        "sport_event_context": {
            "sport": {
                "id": "sr:sport:1",
                "name": "Soccer"
            },
            "category": {
                "id": "sr:category:1",
                "name": "England",
                "country_code": "ENG"
            },
            "competition": {
                "id": "sr:competition:17",
                "name": "Premier League",
                "gender": "men"
            },
            "season": {
                "id": "sr:season:105353",
                "name": "Premier League 23/24",
                "start_date": "2023-08-11",
                "end_date": "2024-05-19",
                "year": "23/24",
                "competition_id": "sr:competition:17"
            },
            "stage": {
                "order": 1,
                "type": "league",
                "phase": "regular season",
                "start_date": "2023-08-11",
                "end_date": "2024-05-19",
                "year": "23/24"
            },
            "round": {
                "number": 9
            },
            "groups": [
                {
                    "id": "sr:league:74627",
                    "name": "Premier League 23/24"
                }
            ]
        },
        "coverage": {
            "type": "sport_event",
            "sport_event_properties": {
                "lineups": true,
                "venue": true,
                "extended_player_stats": true,
                "extended_team_stats": true,
                "lineups_availability": "pre",
                "ballspotting": true,
                "commentary": true,
                "fun_facts": true,
                "goal_scorers": true,
                "scores": "live",
                "game_clock": true,
                "deeper_play_by_play": true,
                "deeper_player_stats": true,
                "deeper_team_stats": true,
                "basic_play_by_play": true,
                "basic_player_stats": true,
                "basic_team_stats": true
            }
        },
        "competitors": [
            {
                "id": "sr:competitor:17",
                "name": "Manchester City",
                "country": "England",
                "country_code": "ENG",
                "abbreviation": "MCI",
                "qualifier": "home",
                "gender": "male"
            },
            {
                "id": "sr:competitor:30",
                "name": "Brighton & Hove Albion",
                "country": "England",
                "country_code": "ENG",
                "abbreviation": "BRI",
                "qualifier": "away",
                "gender": "male"
            }
        ],
        "venue": {
            "id": "sr:venue:606",
            "name": "Etihad Stadium",
            "capacity": 53400,
            "city_name": "Manchester",
            "country_name": "England",
            "map_coordinates": "53.484592,-2.202695",
            "country_code": "ENG",
            "timezone": "Europe/London"
        },
        "channels": [
            {
                "name": "Sky Sport Uno HD - Hot Bird 1/2/3/4/6 (13.0E)",
                "url": "https://guidatv.sky.it/sport-e-calcio?vista=griglia",
                "country": "Italy",
                "country_code": "ITA"
            },
            {
                "name": "Digi Sport 2 RO - Thor 2/3 (1.0W)",
                "url": "http://www.digisport.ro/Program/",
                "country": "Romania",
                "country_code": "ROU"
            },
            {
                "name": "V Sport Premium HD - Thor 2/3 (1.0W)",
                "url": "https://www.allente.se/tv-guide/",
                "country": "Sweden",
                "country_code": "SWE"
            },
            {
                "name": "Spiler 1 TV - Thor 2/3 (1.0W)",
                "url": "http://spilertv.hu/musorujsag/",
                "country": "Hungary",
                "country_code": "HUN"
            },
            {
                "name": "Spiler 1 TV - Thor 2/3 (1.0W)",
                "url": "http://spilertv.hu/musorujsag/",
                "country": "Romania",
                "country_code": "ROU"
            },
            {
                "name": "Peacock Premium",
                "country": "United States",
                "country_code": "USA"
            },
            {
                "name": "CANAL+ Foot FR - Astra 1C-1H / 2C (19.2E)",
                "url": "https://www.canalplus.com/programme-tv/",
                "country": "France",
                "country_code": "FRA"
            },
            {
                "name": "Novasports PL HD - Hot Bird 1/2/3/4/6 (13.0E)",
                "country": "Greece",
                "country_code": "GRC"
            }
        ],
        "sport_event_conditions": {
            "referees": [
                {
                    "id": "sr:referee:74264",
                    "name": "Jones, Robert",
                    "nationality": "England",
                    "country_code": "ENG",
                    "type": "main_referee"
                },
                {
                    "id": "sr:referee:2053781",
                    "name": "Wood, Timothy",
                    "nationality": "England",
                    "country_code": "ENG",
                    "type": "first_assistant_referee"
                },
                {
                    "id": "sr:referee:2356709",
                    "name": "Meredith, Steve",
                    "type": "second_assistant_referee"
                },
                {
                    "id": "sr:referee:66873",
                    "name": "Simpson, Jeremy",
                    "nationality": "England",
                    "country_code": "ENG",
                    "type": "fourth_official"
                },
                {
                    "id": "sr:referee:144315",
                    "name": "Salisbury, Michael",
                    "nationality": "England",
                    "country_code": "ENG",
                    "type": "video_assistant_referee"
                }
            ],
            "attendance": {
                "count": 53466
            },
            "ground": {
                "neutral": false
            },
            "lineups": {
                "confirmed": true
            }
        }
    },
    "sport_event_status": {
        "status": "inprogress",
        "match_status": "inprogress",
        "home_score": 2,
        "away_score": 1,
        "winner_id": "sr:competitor:17",
        "period_scores": [
            {
                "home_score": 2,
                "away_score": 0,
                "type": "regular_period",
                "number": 1
            },
            {
                "home_score": 0,
                "away_score": 1,
                "type": "regular_period",
                "number": 2
            }
        ],
        "ball_locations": [
            {
                "order": 4,
                "x": 9,
                "y": 50,
                "qualifier": "home"
            },
            {
                "order": 3,
                "x": 10,
                "y": 59,
                "qualifier": "home"
            },
            {
                "order": 2,
                "x": 10,
                "y": 59,
                "qualifier": "away"
            },
            {
                "order": 1,
                "x": 38,
                "y": 91,
                "qualifier": "away"
            }
        ],
        "match_situation": {
            "status": "safe",
            "qualifier": "home",
            "updated_at": "2023-10-21T16:03:21+00:00"
        },
        "clock": {
            "played": "57:17"
        }
    },
    "statistics": {
        "totals": {
            "competitors": [
                {
                    "id": "sr:competitor:17",
                    "name": "Manchester City",
                    "abbreviation": "MCI",
                    "qualifier": "home",
                    "statistics": {
                        "ball_possession": 48,
                        "cards_given": 4,
                        "corner_kicks": 2,
                        "fouls": 9,
                        "free_kicks": 12,
                        "goal_kicks": 4,
                        "injuries": 0,
                        "offsides": 2,
                        "red_cards": 0,
                        "shots_blocked": 1,
                        "shots_off_target": 3,
                        "shots_on_target": 5,
                        "shots_saved": 2,
                        "shots_total": 9,
                        "substitutions": 3,
                        "throw_ins": 13,
                        "yellow_cards": 3,
                        "yellow_red_cards": 1
                    },
                    "players": [
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:44614",
                            "name": "Walker, Kyle",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:125274",
                            "name": "Ortega, Stefan",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:136710",
                            "name": "Kovacic, Mateo",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 1,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:149663",
                            "name": "Ake, Nathan",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 1,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:152077",
                            "name": "Stones, John",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 1,
                                "substituted_out": 0,
                                "yellow_cards": 1,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:189061",
                            "name": "Grealish, Jack",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:254491",
                            "name": "Ederson",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 1,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:318941",
                            "name": "Dias, Ruben",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:331209",
                            "name": "Silva, Bernardo",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 1,
                                "yellow_red_cards": 1
                            },
                            "id": "sr:player:383560",
                            "name": "Akanji, Manuel",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:790679",
                            "name": "Phillips, Kalvin",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 1,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 1,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:844073",
                            "name": "Rodri",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 1,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 2,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:991181",
                            "name": "Haaland, Erling",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1047129",
                            "name": "Foden, Phil",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1051087",
                            "name": "Gomez, Sergio",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 1,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 2,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 2,
                                "shots_on_target": 1,
                                "substituted_in": 0,
                                "substituted_out": 1,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1297614",
                            "name": "Doku, Jeremy",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1560920",
                            "name": "Nunes, Matheus",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 1,
                                "goals_scored": 1,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 1,
                                "shots_off_target": 1,
                                "shots_on_target": 1,
                                "substituted_in": 0,
                                "substituted_out": 1,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1630398",
                            "name": "Alvarez, Julian",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 1,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1645860",
                            "name": "Gvardiol, Josko",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:2246775",
                            "name": "Lewis, Rico",
                            "starter": false
                        }
                    ]
                },
                {
                    "id": "sr:competitor:30",
                    "name": "Brighton & Hove Albion",
                    "abbreviation": "BRI",
                    "qualifier": "away",
                    "statistics": {
                        "ball_possession": 52,
                        "cards_given": 2,
                        "corner_kicks": 2,
                        "fouls": 11,
                        "free_kicks": 11,
                        "goal_kicks": 8,
                        "injuries": 2,
                        "offsides": 1,
                        "red_cards": 0,
                        "shots_blocked": 0,
                        "shots_off_target": 2,
                        "shots_on_target": 3,
                        "shots_saved": 3,
                        "shots_total": 5,
                        "substitutions": 5,
                        "throw_ins": 12,
                        "yellow_cards": 2,
                        "yellow_red_cards": 0
                    },
                    "players": [
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 1,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:791",
                            "name": "Milner, James",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:17054",
                            "name": "Lallana, Adam",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:31867",
                            "name": "Steele, Jason",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 1,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:33902",
                            "name": "Welbeck, Danny",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 1,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 1,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:48480",
                            "name": "Gross, Pascal",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:115365",
                            "name": "Dunk, Lewis",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:216308",
                            "name": "Webster, Adam",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 1,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:219572",
                            "name": "Veltman, Joel",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 1,
                                "yellow_cards": 1,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:301288",
                            "name": "March, Solly",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:341589",
                            "name": "Dahoud, Mahmoud",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 1,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1008323",
                            "name": "Igor",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 1,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1297746",
                            "name": "Gilmour, Billy",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 1,
                                "shots_on_target": 2,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1494743",
                            "name": "Mitoma, Kaoru",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 1,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 1,
                                "substituted_in": 1,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1624504",
                            "name": "Fati, Ansu",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 1,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1630352",
                            "name": "Van Hecke, Jan Paul",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 1,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1710063",
                            "name": "Pedro, Joao",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1859404",
                            "name": "Verbruggen, Bart",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 1,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:1951258",
                            "name": "Ferguson, Evan",
                            "starter": false
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 1,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 0,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:2142670",
                            "name": "Adingra, Simon",
                            "starter": true
                        },
                        {
                            "statistics": {
                                "assists": 0,
                                "corner_kicks": 0,
                                "goals_scored": 0,
                                "offsides": 0,
                                "own_goals": 0,
                                "red_cards": 0,
                                "shots_blocked": 0,
                                "shots_off_target": 0,
                                "shots_on_target": 0,
                                "substituted_in": 0,
                                "substituted_out": 1,
                                "yellow_cards": 0,
                                "yellow_red_cards": 0
                            },
                            "id": "sr:player:2327301",
                            "name": "Baleba, Carlos",
                            "starter": true
                        }
                    ]
                }
            ]
        }
    },
    "timeline": [
        {
            "id": 1572094430,
            "type": "match_started",
            "time": "2023-10-21T14:02:38+00:00"
        },
        {
            "id": 1572094428,
            "type": "period_start",
            "time": "2023-10-21T14:02:38+00:00",
            "period": 1,
            "period_type": "regular_period",
            "period_name": "regular_period"
        },
        {
            "id": 1572096536,
            "type": "throw_in",
            "time": "2023-10-21T14:03:32+00:00",
            "match_time": 1,
            "match_clock": "0:40",
            "competitor": "away",
            "x": 15,
            "y": 100,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Can Brighton capitalize from this throw-in deep inside Man City's half?"
                }
            ]
        },
        {
            "id": 1572098140,
            "type": "free_kick",
            "time": "2023-10-21T14:04:08+00:00",
            "match_time": 2,
            "match_clock": "1:16",
            "competitor": "away",
            "x": 15,
            "y": 97,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Free kick in a good position for Brighton!"
                }
            ]
        },
        {
            "id": 1572098824,
            "type": "throw_in",
            "time": "2023-10-21T14:04:27+00:00",
            "match_time": 2,
            "match_clock": "1:35",
            "competitor": "away",
            "x": 7,
            "y": 100,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones signals a throw-in for Brighton, close to Man City's area."
                }
            ]
        },
        {
            "id": 1572102790,
            "type": "throw_in",
            "time": "2023-10-21T14:06:13+00:00",
            "match_time": 4,
            "match_clock": "3:20",
            "competitor": "home",
            "x": 36,
            "y": 0,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones awards the home team a throw-in."
                }
            ]
        },
        {
            "id": 1572106604,
            "type": "shot_off_target",
            "time": "2023-10-21T14:07:51+00:00",
            "match_time": 5,
            "match_clock": "4:58",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1297614",
                    "name": "Doku, Jeremy"
                }
            ],
            "x": 87,
            "y": 40,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City are coming forward and Jeremy Doku gets in a strike, it misses the target, however."
                }
            ],
            "outcome": "miss"
        },
        {
            "id": 1572106610,
            "type": "goal_kick",
            "time": "2023-10-21T14:07:51+00:00",
            "match_time": 5,
            "match_clock": "4:58",
            "competitor": "away",
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Goal kick for Brighton at Etihad Stadium."
                }
            ]
        },
        {
            "id": 1572110326,
            "type": "possible_goal",
            "time": "2023-10-21T14:09:25+00:00",
            "match_time": 7,
            "match_clock": "6:28",
            "competitor": "home",
            "period": 1,
            "period_type": "regular_period"
        },
        {
            "id": 1572110362,
            "type": "score_change",
            "time": "2023-10-21T14:09:26+00:00",
            "match_time": 7,
            "match_clock": "6:28",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1630398",
                    "name": "Alvarez, Julian",
                    "type": "scorer"
                },
                {
                    "id": "sr:player:1297614",
                    "name": "Doku, Jeremy",
                    "type": "assist"
                }
            ],
            "x": 93,
            "y": 42,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Julian Alvarez puts the ball in the net and the home team now lead 1-0."
                },
                {
                    "text": "That's a fine assist from Jeremy Doku."
                }
            ],
            "home_score": 1,
            "away_score": 0
        },
        {
            "id": 1572113624,
            "type": "throw_in",
            "time": "2023-10-21T14:10:51+00:00",
            "match_time": 8,
            "match_clock": "7:57",
            "competitor": "home",
            "x": 15,
            "y": 100,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Ball safe as Man City is awarded a throw-in in their half."
                }
            ]
        },
        {
            "id": 1572119864,
            "type": "throw_in",
            "time": "2023-10-21T14:13:35+00:00",
            "match_time": 11,
            "match_clock": "10:43",
            "competitor": "home",
            "x": 44,
            "y": 100,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in for Man City at Etihad Stadium."
                }
            ]
        },
        {
            "id": 1572121454,
            "type": "shot_on_target",
            "time": "2023-10-21T14:14:18+00:00",
            "match_time": 12,
            "match_clock": "11:25",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1645860",
                    "name": "Gvardiol, Josko"
                }
            ],
            "x": 82,
            "y": 44,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City pushes forward through Josko Gvardiol, whose finish on goal is saved."
                }
            ]
        },
        {
            "id": 1572121464,
            "type": "shot_saved",
            "time": "2023-10-21T14:14:18+00:00",
            "match_time": 12,
            "match_clock": "11:25",
            "competitor": "away",
            "period": 1,
            "period_type": "regular_period"
        },
        {
            "id": 1572122868,
            "type": "shot_on_target",
            "time": "2023-10-21T14:14:54+00:00",
            "match_time": 13,
            "match_clock": "12:01",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:1494743",
                    "name": "Mitoma, Kaoru"
                }
            ],
            "x": 2,
            "y": 60,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Kaoru Mitoma of Brighton smashes in a shot on target. The keeper saves, though."
                }
            ]
        },
        {
            "id": 1572122876,
            "type": "shot_saved",
            "time": "2023-10-21T14:14:54+00:00",
            "match_time": 13,
            "match_clock": "12:01",
            "competitor": "home",
            "period": 1,
            "period_type": "regular_period"
        },
        {
            "id": 1572127892,
            "type": "injury",
            "time": "2023-10-21T14:16:55+00:00",
            "match_time": 15,
            "match_clock": "14:02",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:33902",
                    "name": "Welbeck, Danny"
                }
            ],
            "x": 29,
            "y": 53,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Danny Welbeck is writhing in pain and play has been suspended for a few moments."
                }
            ]
        },
        {
            "id": 1572130314,
            "type": "substitution",
            "time": "2023-10-21T14:18:01+00:00",
            "match_time": 16,
            "match_clock": "15:09",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:33902",
                    "name": "Welbeck, Danny",
                    "type": "substituted_out"
                },
                {
                    "id": "sr:player:1951258",
                    "name": "Ferguson, Evan",
                    "type": "substituted_in"
                }
            ],
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Evan Ferguson (Brighton) has replaced the possibly injured Danny Welbeck at Etihad Stadium."
                }
            ]
        },
        {
            "id": 1572131496,
            "type": "throw_in",
            "time": "2023-10-21T14:18:33+00:00",
            "match_time": 16,
            "match_clock": "15:41",
            "competitor": "home",
            "x": 86,
            "y": 0,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in for Man City close to the penalty box."
                }
            ]
        },
        {
            "id": 1572132746,
            "type": "throw_in",
            "time": "2023-10-21T14:19:06+00:00",
            "match_time": 17,
            "match_clock": "16:14",
            "competitor": "away",
            "x": 76,
            "y": 0,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton awarded a throw-in in their own half."
                }
            ]
        },
        {
            "id": 1572135144,
            "type": "goal_kick",
            "time": "2023-10-21T14:20:08+00:00",
            "match_time": 18,
            "match_clock": "17:15",
            "competitor": "away",
            "x": 95,
            "y": 50,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton have a goal kick."
                }
            ]
        },
        {
            "id": 1572136286,
            "type": "throw_in",
            "time": "2023-10-21T14:20:39+00:00",
            "match_time": 18,
            "match_clock": "17:47",
            "competitor": "away",
            "x": 72,
            "y": 100,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in for Brighton in their own half."
                }
            ]
        },
        {
            "id": 1572137204,
            "type": "possible_goal",
            "time": "2023-10-21T14:21:04+00:00",
            "match_time": 19,
            "match_clock": "18:07",
            "competitor": "home",
            "period": 1,
            "period_type": "regular_period"
        },
        {
            "id": 1572137208,
            "type": "score_change",
            "time": "2023-10-21T14:21:04+00:00",
            "match_time": 19,
            "match_clock": "18:07",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:991181",
                    "name": "Haaland, Erling",
                    "type": "scorer"
                }
            ],
            "x": 84,
            "y": 48,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Goal! Man City extend their lead to 2-0 through Erling Haaland."
                }
            ],
            "home_score": 2,
            "away_score": 0
        },
        {
            "id": 1572140126,
            "type": "throw_in",
            "time": "2023-10-21T14:22:27+00:00",
            "match_time": 20,
            "match_clock": "19:34",
            "competitor": "home",
            "x": 57,
            "y": 100,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones signals a Man City throw-in in Brighton's half."
                }
            ]
        },
        {
            "id": 1572147212,
            "type": "throw_in",
            "time": "2023-10-21T14:25:52+00:00",
            "match_time": 23,
            "match_clock": "22:59",
            "competitor": "home",
            "x": 89,
            "y": 0,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in high up the field for Man City in Manchester."
                }
            ]
        },
        {
            "id": 1572149264,
            "type": "free_kick",
            "time": "2023-10-21T14:26:49+00:00",
            "match_time": 24,
            "match_clock": "23:56",
            "competitor": "away",
            "x": 92,
            "y": 54,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Free kick for Brighton in their own half."
                }
            ]
        },
        {
            "id": 1572151278,
            "type": "video_assistant_referee",
            "time": "2023-10-21T14:27:50+00:00",
            "match_time": 25,
            "match_clock": "24:53",
            "period": 1,
            "period_type": "regular_period",
            "description": "penalty",
            "competitor": "home"
        },
        {
            "id": 1572151434,
            "type": "video_assistant_referee_over",
            "time": "2023-10-21T14:27:56+00:00",
            "match_time": 26,
            "match_clock": "25:03",
            "period": 1,
            "period_type": "regular_period",
            "description": "no_penalty",
            "competitor": "home"
        },
        {
            "id": 1572152488,
            "type": "shot_off_target",
            "time": "2023-10-21T14:28:30+00:00",
            "match_time": 26,
            "match_clock": "25:36",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1297614",
                    "name": "Doku, Jeremy"
                }
            ],
            "x": 90,
            "y": 36,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City's Jeremy Doku gets his shot away but it misses the target."
                }
            ],
            "outcome": "miss"
        },
        {
            "id": 1572152508,
            "type": "goal_kick",
            "time": "2023-10-21T14:28:30+00:00",
            "match_time": 26,
            "match_clock": "25:36",
            "competitor": "away",
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "It's a goal kick for the away team in Manchester."
                }
            ]
        },
        {
            "id": 1572159866,
            "type": "corner_kick",
            "time": "2023-10-21T14:32:03+00:00",
            "match_time": 30,
            "match_clock": "29:09",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:844073",
                    "name": "Rodri"
                }
            ],
            "x": 100,
            "y": 0,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Corner awarded to Man City."
                }
            ]
        },
        {
            "id": 1572160520,
            "type": "free_kick",
            "time": "2023-10-21T14:32:22+00:00",
            "match_time": 30,
            "match_clock": "29:28",
            "competitor": "away",
            "x": 88,
            "y": 12,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton awarded a free kick in their own half."
                }
            ]
        },
        {
            "id": 1572163312,
            "type": "corner_kick",
            "time": "2023-10-21T14:33:43+00:00",
            "match_time": 31,
            "match_clock": "30:50",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1630398",
                    "name": "Alvarez, Julian"
                }
            ],
            "x": 100,
            "y": 100,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City have been awarded a corner by Robert Jones."
                }
            ]
        },
        {
            "id": 1572165920,
            "type": "throw_in",
            "time": "2023-10-21T14:35:00+00:00",
            "match_time": 33,
            "match_clock": "32:07",
            "competitor": "home",
            "x": 44,
            "y": 100,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in Man City."
                }
            ]
        },
        {
            "id": 1572168006,
            "type": "throw_in",
            "time": "2023-10-21T14:36:02+00:00",
            "match_time": 34,
            "match_clock": "33:05",
            "competitor": "home",
            "x": 83,
            "y": 0,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton needs to be cautious. Man City have an attacking throw-in."
                }
            ]
        },
        {
            "id": 1572171008,
            "type": "goal_kick",
            "time": "2023-10-21T14:37:22+00:00",
            "match_time": 35,
            "match_clock": "34:28",
            "competitor": "away",
            "x": 95,
            "y": 50,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Ball goes out of play for a Brighton goal kick."
                }
            ]
        },
        {
            "id": 1572171860,
            "type": "throw_in",
            "time": "2023-10-21T14:37:44+00:00",
            "match_time": 35,
            "match_clock": "34:51",
            "competitor": "home",
            "x": 41,
            "y": 0,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City awarded a throw-in in their own half."
                }
            ]
        },
        {
            "id": 1572172846,
            "type": "free_kick",
            "time": "2023-10-21T14:38:11+00:00",
            "match_time": 36,
            "match_clock": "35:18",
            "competitor": "home",
            "x": 44,
            "y": 82,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones signals a free kick to Man City in their own half."
                }
            ]
        },
        {
            "id": 1572173490,
            "type": "yellow_card",
            "time": "2023-10-21T14:38:26+00:00",
            "match_time": 36,
            "match_clock": "35:27",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:301288",
                    "name": "March, Solly"
                }
            ],
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Solly March (Brighton) gets a yellow card."
                }
            ]
        },
        {
            "id": 1572174860,
            "type": "free_kick",
            "time": "2023-10-21T14:39:07+00:00",
            "match_time": 37,
            "match_clock": "36:14",
            "competitor": "home",
            "x": 55,
            "y": 6,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "In Manchester a free kick has been awarded the home team."
                }
            ]
        },
        {
            "id": 1572177968,
            "type": "offside",
            "time": "2023-10-21T14:40:40+00:00",
            "match_time": 38,
            "match_clock": "37:47",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1297614",
                    "name": "Doku, Jeremy"
                }
            ],
            "x": 89,
            "y": 19,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Jeremy Doku for Man City is whistled offside."
                }
            ]
        },
        {
            "id": 1572178422,
            "type": "yellow_card",
            "time": "2023-10-21T14:40:53+00:00",
            "match_time": 38,
            "match_clock": "37:57",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:844073",
                    "name": "Rodri"
                }
            ],
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Rodri (Man City) has been booked and must now be careful not to get a second yellow card."
                }
            ]
        },
        {
            "id": 1572179848,
            "type": "throw_in",
            "time": "2023-10-21T14:41:38+00:00",
            "match_time": 39,
            "match_clock": "38:45",
            "competitor": "home",
            "x": 68,
            "y": 100,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City to take a throw-in in Brighton territory."
                }
            ]
        },
        {
            "id": 1572184788,
            "type": "free_kick",
            "time": "2023-10-21T14:44:05+00:00",
            "match_time": 42,
            "match_clock": "41:12",
            "competitor": "home",
            "x": 57,
            "y": 51,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Free kick Man City."
                }
            ]
        },
        {
            "id": 1572189228,
            "type": "goal_kick",
            "time": "2023-10-21T14:46:01+00:00",
            "match_time": 44,
            "match_clock": "43:08",
            "competitor": "away",
            "x": 95,
            "y": 50,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones awards Brighton a goal kick."
                }
            ]
        },
        {
            "id": 1572191634,
            "type": "free_kick",
            "time": "2023-10-21T14:47:10+00:00",
            "match_time": 45,
            "match_clock": "44:17",
            "competitor": "away",
            "x": 47,
            "y": 30,
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones signals a free kick to Brighton."
                }
            ]
        },
        {
            "id": 1572193450,
            "type": "injury_time_shown",
            "time": "2023-10-21T14:48:05+00:00",
            "match_time": 45,
            "match_clock": "45:00",
            "stoppage_time": 1,
            "stoppage_time_clock": "0:12",
            "period": 1,
            "period_type": "regular_period",
            "injury_time_announced": 4
        },
        {
            "id": 1572194496,
            "type": "throw_in",
            "time": "2023-10-21T14:48:38+00:00",
            "match_time": 45,
            "match_clock": "45:00",
            "competitor": "away",
            "x": 29,
            "y": 100,
            "stoppage_time": 1,
            "stoppage_time_clock": "0:44",
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Can Brighton get the ball into an attacking position from this throw-in in Man City's half?"
                }
            ]
        },
        {
            "id": 1572197796,
            "type": "offside",
            "time": "2023-10-21T14:50:34+00:00",
            "match_time": 45,
            "match_clock": "45:00",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1297614",
                    "name": "Doku, Jeremy"
                }
            ],
            "x": 73,
            "y": 11,
            "stoppage_time": 3,
            "stoppage_time_clock": "2:40",
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Jeremy Doku for the home team is judged to be offside."
                }
            ]
        },
        {
            "id": 1572200682,
            "type": "period_score",
            "time": "2023-10-21T14:51:55+00:00",
            "period": 1,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "The first half has been concluded at Etihad Stadium."
                }
            ]
        },
        {
            "id": 1572200684,
            "type": "break_start",
            "time": "2023-10-21T14:51:55+00:00",
            "period_type": "pause",
            "break_name": "pause"
        },
        {
            "id": 1572228640,
            "type": "period_start",
            "time": "2023-10-21T15:09:03+00:00",
            "period": 2,
            "period_type": "regular_period",
            "period_name": "regular_period"
        },
        {
            "id": 1572227334,
            "type": "substitution",
            "time": "2023-10-21T15:08:22+00:00",
            "match_time": 46,
            "match_clock": "45:00",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:791",
                    "name": "Milner, James",
                    "type": "substituted_out"
                },
                {
                    "id": "sr:player:219572",
                    "name": "Veltman, Joel",
                    "type": "substituted_in"
                }
            ],
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Joel Veltman is on a sub for James Milner for Brighton."
                }
            ]
        },
        {
            "id": 1572236210,
            "type": "free_kick",
            "time": "2023-10-21T15:12:50+00:00",
            "match_time": 49,
            "match_clock": "48:46",
            "competitor": "home",
            "x": 8,
            "y": 13,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City awarded a free kick in their own half."
                }
            ]
        },
        {
            "id": 1572241410,
            "type": "shot_off_target",
            "time": "2023-10-21T15:15:19+00:00",
            "match_time": 52,
            "match_clock": "51:16",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:48480",
                    "name": "Gross, Pascal"
                }
            ],
            "x": 10,
            "y": 43,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton's Pascal Gross misses with an attempt on goal."
                }
            ],
            "outcome": "miss"
        },
        {
            "id": 1572241448,
            "type": "goal_kick",
            "time": "2023-10-21T15:15:20+00:00",
            "match_time": 52,
            "match_clock": "51:16",
            "competitor": "home",
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Ball goes out of play for a Man City goal kick."
                }
            ]
        },
        {
            "id": 1572242998,
            "type": "free_kick",
            "time": "2023-10-21T15:16:05+00:00",
            "match_time": 53,
            "match_clock": "52:02",
            "competitor": "home",
            "x": 38,
            "y": 54,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones signals a free kick to Man City in their own half."
                }
            ]
        },
        {
            "id": 1572245960,
            "type": "throw_in",
            "time": "2023-10-21T15:17:33+00:00",
            "match_time": 54,
            "match_clock": "53:29",
            "competitor": "home",
            "x": 42,
            "y": 0,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in for Man City in their own half."
                }
            ]
        },
        {
            "id": 1572249748,
            "type": "throw_in",
            "time": "2023-10-21T15:19:19+00:00",
            "match_time": 56,
            "match_clock": "55:16",
            "competitor": "away",
            "x": 32,
            "y": 0,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "A throw-in for the away team on the opposite half."
                }
            ]
        },
        {
            "id": 1572252094,
            "type": "offside",
            "time": "2023-10-21T15:20:24+00:00",
            "match_time": 57,
            "match_clock": "56:20",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:2142670",
                    "name": "Adingra, Simon"
                }
            ],
            "x": 31,
            "y": 12,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton's Simon Adingra has run offside."
                }
            ]
        },
        {
            "id": 1572254280,
            "type": "throw_in",
            "time": "2023-10-21T15:21:28+00:00",
            "match_time": 58,
            "match_clock": "57:24",
            "competitor": "home",
            "x": 83,
            "y": 100,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City have a dangerous throw-in."
                }
            ]
        },
        {
            "id": 1572255376,
            "type": "free_kick",
            "time": "2023-10-21T15:22:00+00:00",
            "match_time": 58,
            "match_clock": "57:56",
            "competitor": "home",
            "x": 85,
            "y": 69,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Can Man City capitalize from this dangerous free kick?"
                }
            ]
        },
        {
            "id": 1572258178,
            "type": "shot_off_target",
            "time": "2023-10-21T15:23:29+00:00",
            "match_time": 60,
            "match_clock": "59:27",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1630398",
                    "name": "Alvarez, Julian"
                }
            ],
            "x": 85,
            "y": 69,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Julian Alvarez of Man City gets in a strike, but is off target."
                }
            ],
            "outcome": "miss"
        },
        {
            "id": 1572258180,
            "type": "goal_kick",
            "time": "2023-10-21T15:23:29+00:00",
            "match_time": 60,
            "match_clock": "59:27",
            "competitor": "away",
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton have a goal kick."
                }
            ]
        },
        {
            "id": 1572261030,
            "type": "free_kick",
            "time": "2023-10-21T15:24:46+00:00",
            "match_time": 61,
            "match_clock": "60:44",
            "competitor": "away",
            "x": 83,
            "y": 69,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Free kick for Brighton in their own half."
                }
            ]
        },
        {
            "id": 1572262926,
            "type": "goal_kick",
            "time": "2023-10-21T15:25:34+00:00",
            "match_time": 62,
            "match_clock": "61:32",
            "competitor": "away",
            "x": 95,
            "y": 50,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones awards Brighton a goal kick."
                }
            ]
        },
        {
            "id": 1572263842,
            "type": "free_kick",
            "time": "2023-10-21T15:26:06+00:00",
            "match_time": 63,
            "match_clock": "62:03",
            "competitor": "away",
            "x": 40,
            "y": 42,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Free kick for Brighton in the half of Man City."
                }
            ]
        },
        {
            "id": 1572264032,
            "type": "yellow_card",
            "time": "2023-10-21T15:26:12+00:00",
            "match_time": 63,
            "match_clock": "62:06",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:383560",
                    "name": "Akanji, Manuel"
                }
            ],
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Manuel Akanji is booked for the home team."
                }
            ]
        },
        {
            "id": 1572267158,
            "type": "yellow_card",
            "time": "2023-10-21T15:27:54+00:00",
            "match_time": 64,
            "match_clock": "63:47",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:1008323",
                    "name": "Igor"
                }
            ],
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Igor (Brighton) has received a yellow card from Robert Jones."
                }
            ]
        },
        {
            "id": 1572267444,
            "type": "free_kick",
            "time": "2023-10-21T15:28:01+00:00",
            "match_time": 64,
            "match_clock": "63:59",
            "competitor": "home",
            "x": 40,
            "y": 56,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City awarded a free kick in their own half."
                }
            ]
        },
        {
            "id": 1572268518,
            "type": "free_kick",
            "time": "2023-10-21T15:28:34+00:00",
            "match_time": 65,
            "match_clock": "64:32",
            "competitor": "home",
            "x": 49,
            "y": 95,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Free kick for Man City in their own half."
                }
            ]
        },
        {
            "id": 1572269282,
            "type": "substitution",
            "time": "2023-10-21T15:28:57+00:00",
            "match_time": 65,
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:1710063",
                    "name": "Pedro, Joao",
                    "type": "substituted_out"
                },
                {
                    "id": "sr:player:1624504",
                    "name": "Fati, Ansu",
                    "type": "substituted_in"
                }
            ],
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Roberto De Zerbi (Brighton) is making a third substitution, with Ansu Fati replacing Joao Pedro."
                }
            ]
        },
        {
            "id": 1572269774,
            "type": "substitution",
            "time": "2023-10-21T15:29:13+00:00",
            "match_time": 66,
            "match_clock": "65:10",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:2327301",
                    "name": "Baleba, Carlos",
                    "type": "substituted_out"
                },
                {
                    "id": "sr:player:1297746",
                    "name": "Gilmour, Billy",
                    "type": "substituted_in"
                }
            ],
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Billy Gilmour is replacing Carlos Baleba for the away team."
                }
            ]
        },
        {
            "id": 1572271532,
            "type": "throw_in",
            "time": "2023-10-21T15:30:00+00:00",
            "match_time": 66,
            "match_clock": "65:58",
            "competitor": "away",
            "x": 71,
            "y": 0,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in for Brighton at Etihad Stadium."
                }
            ]
        },
        {
            "id": 1572271882,
            "type": "throw_in",
            "time": "2023-10-21T15:30:11+00:00",
            "match_time": 67,
            "match_clock": "66:08",
            "competitor": "away",
            "x": 39,
            "y": 0,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in for Brighton in the half of Man City."
                }
            ]
        },
        {
            "id": 1572272758,
            "type": "shot_on_target",
            "time": "2023-10-21T15:30:36+00:00",
            "match_time": 67,
            "match_clock": "66:34",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:991181",
                    "name": "Haaland, Erling"
                }
            ],
            "x": 94,
            "y": 58,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City's Erling Haaland is on target but unsuccessful."
                }
            ]
        },
        {
            "id": 1572272762,
            "type": "shot_saved",
            "time": "2023-10-21T15:30:36+00:00",
            "match_time": 67,
            "match_clock": "66:34",
            "competitor": "away",
            "period": 2,
            "period_type": "regular_period"
        },
        {
            "id": 1572272970,
            "type": "free_kick",
            "time": "2023-10-21T15:30:42+00:00",
            "match_time": 67,
            "match_clock": "66:40",
            "competitor": "away",
            "x": 71,
            "y": 7,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones signals a free kick to Brighton in their own half."
                }
            ]
        },
        {
            "id": 1572276192,
            "type": "shot_on_target",
            "time": "2023-10-21T15:32:17+00:00",
            "match_time": 69,
            "match_clock": "68:14",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:1494743",
                    "name": "Mitoma, Kaoru"
                }
            ],
            "x": 15,
            "y": 68,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton drives forward and Kaoru Mitoma gets in a shot. Without netting, however."
                }
            ]
        },
        {
            "id": 1572276194,
            "type": "shot_saved",
            "time": "2023-10-21T15:32:17+00:00",
            "match_time": 69,
            "match_clock": "68:14",
            "competitor": "home",
            "period": 2,
            "period_type": "regular_period"
        },
        {
            "id": 1572277534,
            "type": "throw_in",
            "time": "2023-10-21T15:32:56+00:00",
            "match_time": 69,
            "match_clock": "68:53",
            "competitor": "away",
            "x": 13,
            "y": 0,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton have a dangerous throw-in."
                }
            ]
        },
        {
            "id": 1572279436,
            "type": "corner_kick",
            "time": "2023-10-21T15:33:50+00:00",
            "match_time": 70,
            "match_clock": "69:47",
            "competitor": "away",
            "x": 0,
            "y": 0,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Corner awarded to Brighton."
                }
            ]
        },
        {
            "id": 1572279716,
            "type": "shot_off_target",
            "time": "2023-10-21T15:33:59+00:00",
            "match_time": 70,
            "match_clock": "69:55",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:1494743",
                    "name": "Mitoma, Kaoru"
                }
            ],
            "x": 7,
            "y": 57,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton attack but Kaoru Mitoma's header doesn't find the target."
                }
            ],
            "outcome": "miss"
        },
        {
            "id": 1572279720,
            "type": "goal_kick",
            "time": "2023-10-21T15:33:59+00:00",
            "match_time": 70,
            "match_clock": "69:55",
            "competitor": "home",
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "It's a goal kick for the home team in Manchester."
                }
            ]
        },
        {
            "id": 1572281600,
            "type": "shot_on_target",
            "time": "2023-10-21T15:34:56+00:00",
            "match_time": 71,
            "match_clock": "70:53",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1297614",
                    "name": "Doku, Jeremy"
                }
            ],
            "x": 89,
            "y": 28,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Jeremy Doku for Man City drives towards goal at Etihad Stadium. But the finish is unsuccessful."
                }
            ]
        },
        {
            "id": 1572281670,
            "type": "shot_saved",
            "time": "2023-10-21T15:34:57+00:00",
            "match_time": 71,
            "match_clock": "70:53",
            "competitor": "away",
            "period": 2,
            "period_type": "regular_period"
        },
        {
            "id": 1572282880,
            "type": "goal_kick",
            "time": "2023-10-21T15:35:31+00:00",
            "match_time": 72,
            "match_clock": "71:27",
            "competitor": "home",
            "x": 5,
            "y": 50,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Goal kick for Man City at Etihad Stadium."
                }
            ]
        },
        {
            "id": 1572285298,
            "type": "possible_goal",
            "time": "2023-10-21T15:36:43+00:00",
            "match_time": 73,
            "match_clock": "72:35",
            "competitor": "away",
            "period": 2,
            "period_type": "regular_period"
        },
        {
            "id": 1572285350,
            "type": "score_change",
            "time": "2023-10-21T15:36:46+00:00",
            "match_time": 73,
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:1624504",
                    "name": "Fati, Ansu",
                    "type": "scorer"
                }
            ],
            "x": 7,
            "y": 57,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Goal! Ansu Fati pulls one back for Brighton to make it 2-1."
                }
            ],
            "home_score": 2,
            "away_score": 1
        },
        {
            "id": 1572287596,
            "type": "substitution",
            "time": "2023-10-21T15:38:00+00:00",
            "match_time": 74,
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:152077",
                    "name": "Stones, John",
                    "type": "substituted_out"
                },
                {
                    "id": "sr:player:318941",
                    "name": "Dias, Ruben",
                    "type": "substituted_in"
                }
            ],
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Ruben Dias is replacing John Stones for Man City at Etihad Stadium."
                }
            ]
        },
        {
            "id": 1572287946,
            "type": "substitution",
            "time": "2023-10-21T15:38:14+00:00",
            "match_time": 75,
            "match_clock": "74:10",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1297614",
                    "name": "Doku, Jeremy",
                    "type": "substituted_out"
                },
                {
                    "id": "sr:player:189061",
                    "name": "Grealish, Jack",
                    "type": "substituted_in"
                }
            ],
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City make their second substitution with Jack Grealish replacing Jeremy Doku."
                }
            ]
        },
        {
            "id": 1572295232,
            "type": "free_kick",
            "time": "2023-10-21T15:41:56+00:00",
            "match_time": 78,
            "match_clock": "77:53",
            "competitor": "home",
            "x": 40,
            "y": 32,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Free kick for Man City in their own half."
                }
            ]
        },
        {
            "id": 1572303012,
            "type": "goal_kick",
            "time": "2023-10-21T15:46:02+00:00",
            "match_time": 83,
            "match_clock": "82:00",
            "competitor": "away",
            "x": 95,
            "y": 50,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Ball goes out of play for a Brighton goal kick."
                }
            ]
        },
        {
            "id": 1572305726,
            "type": "throw_in",
            "time": "2023-10-21T15:47:31+00:00",
            "match_time": 84,
            "match_clock": "83:29",
            "competitor": "away",
            "x": 16,
            "y": 0,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City needs to be cautious. Brighton have an attacking throw-in."
                }
            ]
        },
        {
            "id": 1572305986,
            "type": "throw_in",
            "time": "2023-10-21T15:47:42+00:00",
            "match_time": 84,
            "match_clock": "83:38",
            "competitor": "away",
            "x": 13,
            "y": 0,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in for Brighton close to the penalty box."
                }
            ]
        },
        {
            "id": 1572306520,
            "type": "yellow_card",
            "time": "2023-10-21T15:48:00+00:00",
            "match_time": 84,
            "match_clock": "83:49",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:189061",
                    "name": "Grealish, Jack"
                }
            ],
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "At Etihad Stadium, Jack Grealish has been yellow-carded for the home team."
                }
            ]
        },
        {
            "id": 1572307882,
            "type": "free_kick",
            "time": "2023-10-21T15:48:51+00:00",
            "match_time": 85,
            "match_clock": "84:49",
            "competitor": "home",
            "x": 8,
            "y": 21,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Man City awarded a free kick in their own half."
                }
            ]
        },
        {
            "id": 1572310668,
            "type": "free_kick",
            "time": "2023-10-21T15:50:43+00:00",
            "match_time": 87,
            "match_clock": "86:41",
            "competitor": "home",
            "x": 60,
            "y": 11,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "In Manchester a free kick has been awarded the home team."
                }
            ]
        },
        {
            "id": 1572313556,
            "type": "throw_in",
            "time": "2023-10-21T15:52:30+00:00",
            "match_time": 89,
            "match_clock": "88:28",
            "competitor": "away",
            "x": 78,
            "y": 100,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones awards the away team a throw-in."
                }
            ]
        },
        {
            "id": 1572314590,
            "type": "injury",
            "time": "2023-10-21T15:53:13+00:00",
            "match_time": 90,
            "match_clock": "89:09",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:301288",
                    "name": "March, Solly"
                }
            ],
            "x": 78,
            "y": 100,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Play has been interrupted briefly in Manchester to check on Solly March, who is grimacing with pain."
                }
            ]
        },
        {
            "id": 1572316574,
            "type": "injury_time_shown",
            "time": "2023-10-21T15:54:37+00:00",
            "match_time": 90,
            "match_clock": "90:00",
            "stoppage_time": 1,
            "stoppage_time_clock": "0:33",
            "period": 2,
            "period_type": "regular_period",
            "injury_time_announced": 4
        },
        {
            "id": 1572320048,
            "type": "substitution",
            "time": "2023-10-21T15:57:13+00:00",
            "match_time": 90,
            "match_clock": "90:00",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:301288",
                    "name": "March, Solly",
                    "type": "substituted_out"
                },
                {
                    "id": "sr:player:1630352",
                    "name": "Van Hecke, Jan Paul",
                    "type": "substituted_in"
                }
            ],
            "stoppage_time": 4,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Solly March (Brighton) does not seem to be able to continue. He is replaced by Jan Paul Van Hecke."
                }
            ]
        },
        {
            "id": 1572321156,
            "type": "throw_in",
            "time": "2023-10-21T15:58:03+00:00",
            "match_time": 90,
            "match_clock": "90:00",
            "competitor": "home",
            "x": 81,
            "y": 100,
            "stoppage_time": 4,
            "stoppage_time_clock": "3:59",
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Throw-in high up the field for Man City in Manchester."
                }
            ]
        },
        {
            "id": 1572322192,
            "type": "yellow_red_card",
            "time": "2023-10-21T15:58:52+00:00",
            "match_time": 90,
            "match_clock": "90:00",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:383560",
                    "name": "Akanji, Manuel"
                }
            ],
            "stoppage_time": 5,
            "stoppage_time_clock": "4:49",
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Manuel Akanji in Man City has been yellow-carded a second time by Robert Jones and is being sent off."
                }
            ]
        },
        {
            "id": 1572322290,
            "type": "free_kick",
            "time": "2023-10-21T15:58:57+00:00",
            "match_time": 90,
            "match_clock": "90:00",
            "competitor": "away",
            "x": 65,
            "y": 71,
            "stoppage_time": 5,
            "stoppage_time_clock": "4:52",
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones signals a free kick to Brighton in their own half."
                }
            ]
        },
        {
            "id": 1572323556,
            "type": "substitution",
            "time": "2023-10-21T15:59:44+00:00",
            "match_time": 90,
            "match_clock": "90:00",
            "competitor": "home",
            "players": [
                {
                    "id": "sr:player:1630398",
                    "name": "Alvarez, Julian",
                    "type": "substituted_out"
                },
                {
                    "id": "sr:player:149663",
                    "name": "Ake, Nathan",
                    "type": "substituted_in"
                }
            ],
            "stoppage_time": 6,
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "The home team have replaced Julian Alvarez with Nathan Ake. This is the third substitution made today by Pep Guardiola."
                }
            ]
        },
        {
            "id": 1572327360,
            "type": "corner_kick",
            "time": "2023-10-21T16:01:39+00:00",
            "match_time": 90,
            "match_clock": "90:00",
            "competitor": "away",
            "players": [
                {
                    "id": "sr:player:48480",
                    "name": "Gross, Pascal"
                }
            ],
            "x": 0,
            "y": 0,
            "stoppage_time": 8,
            "stoppage_time_clock": "7:33",
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Brighton have been awarded a corner by Robert Jones."
                }
            ]
        },
        {
            "id": 1572327552,
            "type": "goal_kick",
            "time": "2023-10-21T16:01:43+00:00",
            "match_time": 90,
            "match_clock": "90:00",
            "competitor": "home",
            "x": 5,
            "y": 50,
            "stoppage_time": 8,
            "stoppage_time_clock": "7:40",
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Robert Jones awards Man City a goal kick."
                }
            ]
        },
        {
            "id": 1572329030,
            "type": "free_kick",
            "time": "2023-10-21T16:02:30+00:00",
            "match_time": 90,
            "match_clock": "90:00",
            "competitor": "away",
            "x": 38,
            "y": 91,
            "stoppage_time": 9,
            "stoppage_time_clock": "8:26",
            "period": 2,
            "period_type": "regular_period",
            "commentaries": [
                {
                    "text": "Free kick Brighton."
                }
            ]
        },
        {
            "id": 1572331680,
            "type": "match_ended",
            "time": "2023-10-21T16:03:28+00:00",
            "match_clock": "90:00"
        }
    ]
}`
);
