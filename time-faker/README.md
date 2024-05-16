# Time Faker

What is this!? It's a debugging tool meant to showcase how appoint might work in specified times.

Appoint works by tracking the current time and finds the appropriate appointment to it, it works
as intended, but sometimes the dev just needed a tool to stub it temporarily.

It's a simple fullstack web app that provides a simple UI to change the time offsets on `/`.

Any other apps can retrieve the "current faked time" by making a get request to `/api/time`,
which in turns responds something similar to this:

```json
{
  date: "2024-01-01T00:00:00+07:00"
}
```
