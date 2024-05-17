#!/usr/bin/bash

# First we run the time faker
cd time-faker
npx next dev -p 3355 &

# Second we run the schedule stream
cd ../schedule-stream
PORT=3333 npm run dev &

# Then we run the next dashboard
cd ../next-dashboard
npx next dev -p 3000
