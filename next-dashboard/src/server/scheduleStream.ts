import { createHash } from "node:crypto";

export class ScheduleStream {
  constructor(
    private readonly host: string,
    private readonly secret: string,
  ) { }

  async sendCheckInUpdate(
    schedule: {
      id: number;
      status: "checked-in" | "in-progress" | "finished";
    },
    patientId: number,
  ) {
    return fetch(`http://${this.host}/broadcast/checkInUpdate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schedule,
        challange: this._challange(JSON.stringify({ ...schedule, patientId })),
      }),
    });
  }

  async sendScheduleUpdate(schedule: {
    year: number;
    month: number;
    day: number;
  }) {
    console.log("sending schedule update");
    console.log(`${this.host}/broadcast/scheduleUpdate`);
    return fetch(`http://${this.host}/broadcast/scheduleUpdate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schedule,
        challange: this._challange(JSON.stringify(schedule)),
      }),
    });
  }

  private _challange(payload: string): string {
    return createHash("sha256")
      .update(payload + this.secret)
      .digest("hex");
  }
}
