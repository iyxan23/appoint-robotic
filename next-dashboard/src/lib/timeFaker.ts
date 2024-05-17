import { z } from "zod";

const STALE_AFTER_MS = 1000;

export class TimeFaker {
  constructor(private readonly host: string) { }

  private lastTime?: Date;
  private lastFetched?: number;

  async _fetchTime(): Promise<Date> {
    this.lastFetched = performance.now();
    return fetch(`http://${this.host}/api/time`)
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
