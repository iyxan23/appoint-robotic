import 'dart:convert';

AppointRequest appointRequestFromJson(String str) => AppointRequest.fromJson(json.decode(str));

String appointRequestToJson(AppointRequest data) => json.encode(data.toJson());

class AppointRequest {
    String title;
    End start;
    End end;
    int year;
    int month;
    int day;

    AppointRequest({
        required this.title,
        required this.start,
        required this.end,
        required this.year,
        required this.month,
        required this.day,
    });

    factory AppointRequest.fromJson(Map<String, dynamic> json) => AppointRequest(
        title: json["title"],
        start: End.fromJson(json["start"]),
        end: End.fromJson(json["end"]),
        year: json["year"],
        month: json["month"],
        day: json["day"],
    );

    Map<String, dynamic> toJson() => {
        "title": title,
        "start": start.toJson(),
        "end": end.toJson(),
        "year": year,
        "month": month,
        "day": day,
    };
}

class End {
    int hour;
    int minute;

    End({
        required this.hour,
        required this.minute,
    });

    factory End.fromJson(Map<String, dynamic> json) => End(
        hour: json["hour"],
        minute: json["minute"],
    );

    Map<String, dynamic> toJson() => {
        "hour": hour,
        "minute": minute,
    };
}
