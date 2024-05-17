# Appoint

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/raspberrypi/raspberrypi-original.svg" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg" />
</p>

Appoint is a system of IoT devices to make it easy to arrange medical appointments.

## Batteries Included

- [`next-dashboard/`](next-dashboard/) Next.js-powered dashboard and backend
- [`nfc-backend/`](nfc-backend/) NFC reader backend code on the RPI with python
- [`flutter-app/`](flutter-app/) Flutter-powered mobile app to create appointments and emit NFC signals
- [`schedule-stream/`](schedule-stream/) A simple express server that serves a Socket.IO endpoint to be used to notify subscribers of schedule change
- [`time-faker/`](time-faker/) A simple express server that acts as a time provider that can be offsetted for testing

## Flow

- Patients registers an account through the flutter app
- Creates a new appointment
- Pick an empty schedule
- Patient physically arrive at the appointed location a few minutes before the scheduled time
- Patient scans their phone on an NFC reader provided in the physical location
- Patient waits until the doctor starts the appointment
- Patient gets into a room with the doctor

## The Architecture

Here's an overview of the components used (excluding `time-faker`)

```mermaid
graph LR
    A(Patient Phone) <-- API Calls --> B(Backend Server)
    B -- HTTP Requests --> C(Schedule Stream)
    D(NFC Reader) -- HTTP POST Request --> B
    E(User Frontend) -- HTTP Requests --> B
    A -- NFC --> D
    C -- Websocket (Socket.IO) --> A
    C -- Websocket (Socket.IO) --> E
```

Here's how each components interact with each other (excluding `time-faker`)

```mermaid
sequenceDiagram
    participant Patient
    participant Backend
    participant ScheduleStream
    participant NFCReader
    participant Dashboard
    Patient->>Backend: Register and Login (API Call)
    Backend->>Patient: Provide Token
    Patient->>ScheduleStream: Connect and login with token
    Patient->>Backend: Create Appointment (API Call)
    Backend->>ScheduleStream: Update New Appointment (HTTP Request)
    ScheduleStream->>Dashboard: Realtime Update on New Appointment
    ScheduleStream->>Patient: Realtime Update on New Appointment
    Patient->>Backend: Request Check-In ID (15 mins before appointment)
    Backend->>Patient: Provide Check-In ID
    Patient->>Patient: Tell user to tap on the NFC reader
    Patient->>NFCReader: Taps NFC and sends Check-In ID
    NFCReader->>Backend: Notify Check-In (HTTP POST)
    Backend->>ScheduleStream: Update Check-In Status (HTTP Request)
    ScheduleStream->>Dashboard: Realtime Update on Check-In
    ScheduleStream->>Patient: Realtime Update on Check-In
    Patient->>Patient: Tell user that check-in is successful
    Dashboard->>Backend: Update Appointment to "In-progress" (API Call)
    Backend->>ScheduleStream: Update Appointment Status (HTTP Request)
    ScheduleStream->>Dashboard: Realtime Update on Appointment Status
    ScheduleStream->>Patient: Realtime Update on Appointment Status
    Patient->>Patient: Tell user to enter the room
    Dashboard->>Backend: Update Appointment to "Finished" (API Call)
    Backend->>ScheduleStream: Update Appointment Status (HTTP Request)
    ScheduleStream->>Dashboard: Realtime Update on Appointment Status
    ScheduleStream->>Patient: Realtime Update on Appointment Status
    Patient->>Patient: Show finished page
```

## Competition

This project is supposed to be a submission for a competition named "TURNAMEN ROBOTIK INDONESIA KETUA MPR RI 2024" in the category of creative innovations.
