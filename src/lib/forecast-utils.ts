import type {
  OWMForecastItem,
  OWMWeatherCondition,
  DailyForecast,
  WeatherConditionCategory,
} from "@/types/weather";
import { getConditionCategory, CONDITION_SEVERITY } from "@/lib/constants";

/**
 * Aggregates 3-hour forecast intervals into daily summaries.
 * Skips the current day if it has fewer than 3 data points.
 */
export function aggregateDailyForecasts(
  items: OWMForecastItem[],
  timezoneOffset: number
): DailyForecast[] {
  // Group by local date
  const groups = new Map<
    string,
    { items: OWMForecastItem[]; date: Date }
  >();

  for (const item of items) {
    // Convert to local time using timezone offset
    const localMs = (item.dt + timezoneOffset) * 1000;
    const localDate = new Date(localMs);
    const dateKey = `${localDate.getUTCFullYear()}-${localDate.getUTCMonth()}-${localDate.getUTCDate()}`;

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        items: [],
        date: new Date(
          Date.UTC(
            localDate.getUTCFullYear(),
            localDate.getUTCMonth(),
            localDate.getUTCDate()
          )
        ),
      });
    }
    groups.get(dateKey)!.items.push(item);
  }

  const dailyForecasts: DailyForecast[] = [];
  const entries = Array.from(groups.entries()).sort(
    (a, b) => a[1].date.getTime() - b[1].date.getTime()
  );

  for (let i = 0; i < entries.length && dailyForecasts.length < 5; i++) {
    const [, group] = entries[i];

    // Skip first day if it has fewer than 3 data points
    if (i === 0 && group.items.length < 3) continue;

    const high = Math.max(...group.items.map((it) => it.main.temp_max));
    const low = Math.min(...group.items.map((it) => it.main.temp_min));

    // Pick the most severe condition
    const condition = getMostSevereCondition(group.items);
    const category = getConditionCategory(condition.id);

    const dayLabel = group.date.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    });

    dailyForecasts.push({
      date: group.date,
      dayLabel,
      high,
      low,
      condition,
      conditionCategory: category,
    });
  }

  return dailyForecasts;
}

function getMostSevereCondition(
  items: OWMForecastItem[]
): OWMWeatherCondition {
  let mostSevere = items[0].weather[0];
  let maxSeverity = getSeverity(mostSevere.id);

  for (const item of items) {
    const cond = item.weather[0];
    const severity = getSeverity(cond.id);
    if (severity > maxSeverity) {
      mostSevere = cond;
      maxSeverity = severity;
    }
  }

  return mostSevere;
}

function getSeverity(conditionId: number): number {
  const category: WeatherConditionCategory =
    getConditionCategory(conditionId);
  return CONDITION_SEVERITY[category];
}
