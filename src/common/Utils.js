import { isEmpty } from 'lodash';

export function formatStringDate(dateString) {
  if (!dateString || isEmpty(dateString)) return '';
  // console.log("🚀 ~ formatDate ~ dateString:", dateString);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options)
    .format(date)
    .replace(/(\d{2})\/(\d{2})\/(\d{4}),/, '$3-$1-$2');
}
