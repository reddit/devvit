export function formatNumberWithCommas(number: number): string {
  // Convert the number to a string and add commas to the integer part
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
