import { z } from "zod";
import { env } from "~/env";

const STALE_AFTER_MS = 1000;

export class TimeFaker {
  constructor(private readonly host: string) { }

  private lastTime?: Date;
  private lastFetched?: number;

  async _fetchTime(): Promise<Date> {
    if (!env.TIME_FAKER_USE) {
      return new Date();
    }

    this.lastFetched = performance.now();
    return fetch(`${this.host}/time`)
      .then((res) => res.json())
      .then((r) => z.coerce.date().parseAsync(r.date));
  }

  async getTime(): Promise<Date> {
    if (
      !this.lastTime ||
      (this.lastFetched &&
        performance.now() - this.lastFetched > STALE_AFTER_MS)
    ) {
      this.lastTime = await this._fetchTime();
    }
    return this.lastTime;
  }
}
