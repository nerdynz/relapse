export function fromIsoDate(dt:string): Date {
  return new Date(dt.replace('Z', '').replace('T', ' '))
}

export function toUTCDate(date: Date): Date {
  const utcDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
  return utcDate;
}

export function bodUTCUnix(date: Date): Date {
  const utcDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0
    )
  );
  return utcDate;
}

export function bodUTCUnixSeconds(date: Date): number {
  return toUnixSeconds(bodUTCUnix(date));
}

export function fromUnixSeconds(timeSeconds?: number): Date {
  if (timeSeconds) {
    return new Date(timeSeconds * 1000);
  }
  return new Date();
}

export function toUnixSeconds(date?: Date): number {
  console.log(date);
  if (date) {
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    return unixTimestamp;
  }
  return 0;
}

export function convertUTCDateToLocalDate(date?: Date) {
  if (date) {
    let newDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60 * 1000
    );

    let offset = date.getTimezoneOffset() / 60;
    let hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }
  return new Date();
}
