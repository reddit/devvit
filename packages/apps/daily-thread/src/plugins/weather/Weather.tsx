import type { Devvit } from '@devvit/public-api';
import { getActiveThreadInfo } from '../../PostManager.js';
import { BasicTextComponent } from '../../components/BasicTextComponent.js';

export type Weather = {
  periods: WeatherPeriod[];
  updateTime: string;
};
type WeatherPeriod = {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
};

const weatherCacheKey = 'weatherCacheKey';
const weatherStorageKey = 'weatherStorageKey';

export async function getTheWeather(context: Devvit.Context): Promise<Weather | undefined> {
  const { cache, redis, postId } = context;
  if (!postId) {
    return;
  }
  const livePostInfo = await getActiveThreadInfo(context);

  // Not live? grab the last stored weather
  if (livePostInfo?.id !== postId) {
    const weatherString = await redis.get(`${weatherStorageKey}:${postId}`);
    if (weatherString) {
      return JSON.parse(weatherString) as Weather;
    } else {
      return;
    }
  }

  // Live? Leverage the cache helper to fetch and store the latest weather (1hr ttl)
  const weather = await cache(
    async () => {
      const weather = await fetchWeather();
      if (weather) {
        await redis.set(`${weatherStorageKey}:${postId}`, JSON.stringify(weather));
      }
      return weather;
    },
    { key: `${weatherCacheKey}:${postId}`, ttl: 1000 * 60 * 60 }
  );
  return weather ?? undefined;
}

async function fetchWeather(): Promise<Weather | null> {
  try {
    const url = 'https://api.weather.gov/gridpoints/BOI/133,86/forecast';
    const response = await fetch(url);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    const body = await response.json();
    return body.properties as Weather;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export type WeatherComponentProps = {
  weather: Weather;
};

export const WeatherComponent: Devvit.BlockComponent<WeatherComponentProps> = (
  { weather },
  context
) => {
  const now = weather.periods[0];
  const title = `Today's weather`;
  const description = `${now.name}: ${now.detailedForecast}`;
  return BasicTextComponent(
    {
      data: { title, description },
      iconName: 'day',
      iconBgColor: 'Orangered-300',
    },
    context
  );
};
