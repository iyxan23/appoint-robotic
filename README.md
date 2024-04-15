# Appoint

Appoint is a system of IoT devices to make it easy to arrange medical appointments.

## Batteries Included

- [`next-dashboard/`](next-dashboard/) Next.js-powered dashboard running on an RPI
- [`nfc-backend/`](nfc-backend/) NFC reader backend code on the RPI
- [`flutter-app/`](flutter-app/) Flutter-powered mobile app to create appointments and emit NFC signals

## Flow

- Patients registers an account through the flutter app
- Creates a new appointment
- Pick an empty schedule
- Doctors verify appointments through the Next.js dashboard
- Patient physically arrive at the appointed location a few minutes before the scheduled time
- Patient scans their phone on an NFC reader provided in the physical location
- Patient waits until the flutter app rings
- Patient gets into a room with a doctor

## Competition

This project is supposed to be a submission for a competition named "...".
