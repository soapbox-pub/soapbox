'use strict';

/**
 * Compare numerical primary keys represented as strings.
 * For example, '10' (as a string) is considered less than '9'
 * when sorted alphabetically. So compare string length first.
 *
 * - `0`: id1 == id2
 * - `1`: id1 > id2
 * - `-1`: id1 < id2
 */
function compareId(id1: string, id2: string) {
  if (id1 === id2) {
    return 0;
  }
  if (id1.length === id2.length) {
    return id1 > id2 ? 1 : -1;
  } else {
    return id1.length > id2.length ? 1 : -1;
  }
}

/**
 * Compare by dates, where most recent date is returned first.
 *
 * @param dateString1 - string that is parsable by Date
 * @param dateString2 - string that is parsable by Date
 * @returns 1 | -1 | 0
 */
function compareDate(dateString1: string, dateString2: string) {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);

  if (date2 < date1) return -1;
  if (date2 > date1) return 1;
  return 0;
}

export { compareId, compareDate };