/**
 * Format date to yyyy-mm-dd hh:ii:ss
 * @param value
 * @param format
 */
export const dateFormat = (value?: string | Date, format?: string): string => {
  let output: string = format || 'y-m-d h:i:s';
  if (!value) {
    value = new Date();
  } else if (typeof value === 'string') {
    value = new Date(value);
  }
  return output.toLowerCase()
    .replace('y', value.getFullYear().toString())
    .replace('m', (value.getMonth() + 1 + '').padStart(2, '0'))
    .replace('d', (value.getDay() + '').padStart(2, '0'))
    .replace('h', (value.getHours() + '').padStart(2, '0'))
    .replace('i', (value.getMinutes() + '').padStart(2, '0'))
    .replace('s', (value.getSeconds() + '').padStart(2, '0'));
}
