import 'dart:convert';

List<Schedule> scheduleListFromJson(String str) =>
    List<Schedule>.from(json.decode(str).map((x) => Schedule.fromJson(x)));

String scheduleListToJson(List<Schedule> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

Schedule scheduleFromJson(String str) => Schedule.fromJson(json.decode(str));

String scheduleToJson(Schedule data) => json.encode(data.toJson());

class Schedule {
  String type;
  int id;
  String? title;
  String? status;
  Time start;
  Time end;
  Patient? patient;

  Schedule({
    required this.type,
    required this.id,
    this.title,
    this.status,
    required this.start,
    required this.end,
    this.patient,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) => Schedule(
        type: json["type"],
        id: json["id"],
        title: json["title"],
        status: json["status"],
        start: Time.fromJson(json["start"]),
        end: Time.fromJson(json["end"]),
        patient:
            json["patient"] == null ? null : Patient.fromJson(json["patient"]),
      );

  Map<String, dynamic> toJson() => {
        "type": type,
        "id": id,
        "title": title,
        "status": status,
        "start": start.toJson(),
        "end": end.toJson(),
        "patient": patient?.toJson(),
      };
}

class Time {
  int hour;
  int minute;

  Time({
    required this.hour,
    required this.minute,
  });

  factory Time.fromJson(Map<String, dynamic> json) => Time(
        hour: json["hour"],
        minute: json["minute"],
      );

  Map<String, dynamic> toJson() => {
        "hour": hour,
        "minute": minute,
      };
}

class Patient {
  int id;
  String name;

  Patient({
    required this.id,
    required this.name,
  });

  factory Patient.fromJson(Map<String, dynamic> json) => Patient(
        id: json["id"],
        name: json["name"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
      };
}
