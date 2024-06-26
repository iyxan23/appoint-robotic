import 'dart:convert';

Session sessionFromJson(String str) => Session.fromJson(json.decode(str));

String sessionToJson(Session data) => json.encode(data.toJson());

class Session {
  final int id;
  final String username;
  final String kind;

  Session({
    required this.id,
    required this.username,
    required this.kind,
  });

  factory Session.fromJson(Map<String, dynamic> json) => Session(
        id: json["id"],
        username: json["username"],
        kind: json["kind"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "username": username,
        "kind": kind,
  };
}
