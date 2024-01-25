export function formatDuration(durationInMilliseconds: number): string {
  const seconds = Math.floor(durationInMilliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedDuration = [];

  if (hours > 0) {
    formattedDuration.push(`${hours}h`);
  }

  if (minutes > 0) {
    formattedDuration.push(`${minutes}m`);
  }

  if (remainingSeconds > 0 && formattedDuration.length < 2) {
    formattedDuration.push(`${remainingSeconds}s`);
  }

  return formattedDuration.join(' ');
}
