import 'dart:convert';

List<EmptySchedules> emptySchedulesFromJson(String str) => List<EmptySchedules>.from(json.decode(str).map((x) => EmptySchedules.fromJson(x)));

String emptySchedulesToJson(List<EmptySchedules> data) => json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class EmptySchedules {
    Date date;
    List<EmptyTime> emptyTimes;

    EmptySchedules({
        required this.date,
        required this.emptyTimes,
    });

    factory EmptySchedules.fromJson(Map<String, dynamic> json) => EmptySchedules(
        date: Date.fromJson(json["date"]),
        emptyTimes: List<EmptyTime>.from(json["emptyTimes"].map((x) => EmptyTime.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "date": date.toJson(),
        "emptyTimes": List<dynamic>.from(emptyTimes.map((x) => x.toJson())),
    };
}

class Date {
    int year;
    int month;
    int day;

    Date({
        required this.year,
        required this.month,
        required this.day,
    });

    factory Date.fromJson(Map<String, dynamic> json) => Date(
        year: json["year"],
        month: json["month"],
        day: json["day"],
    );

    Map<String, dynamic> toJson() => {
        "year": year,
        "month": month,
        "day": day,
    };
}

class EmptyTime {
    Time start;
    Time end;

    EmptyTime({
        required this.start,
        required this.end,
    });

    factory EmptyTime.fromJson(Map<String, dynamic> json) => EmptyTime(
        start: Time.fromJson(json["start"]),
        end: Time.fromJson(json["end"]),
    );

    Map<String, dynamic> toJson() => {
        "start": start.toJson(),
        "end": end.toJson(),
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

