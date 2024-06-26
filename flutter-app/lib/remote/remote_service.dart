import 'dart:async';
import 'dart:convert';

import 'package:appoint/models/appoint_req.dart';
import 'package:appoint/models/empty_schedules.dart';
import 'package:appoint/models/schedule.dart';
import 'package:appoint/models/session.dart';
import 'package:http/http.dart' as http;
import 'cache.dart';
import 'session_manager.dart';

sealed class RemoteResponse<T> {}

class RemoteSuccess<T> extends RemoteResponse<T> {
  final T data;
  RemoteSuccess(this.data);
}

class RemoteError<T> extends RemoteResponse<T> {
  final String message;
  RemoteError(this.message);
}

class RemoteService {
  RemoteService({required this.urlBase});

  late final http.Client client = http.Client();
  final String urlBase;
  final Cache cache = Cache();
  final SessionManager sessionManager = SessionManager();

  static const _emptySchedulesKey = "emptySchedules";

  Future<RemoteResponse<List<Schedule>>> listAppointments() async {
    var resp = await cache.getOrSetAsync(
        _emptySchedulesKey, () => getWithSession("/patient/appointments"));

    if (resp is RemoteSuccess) {
      return RemoteSuccess(scheduleListFromJson((resp as RemoteSuccess).data));
    } else {
      return (resp as RemoteError) as RemoteResponse<List<Schedule>>;
    }
  }

  Future<RemoteResponse<String>> checkIn(int scheduleId) async {
    var uri = Uri.parse('$urlBase/patient/checkin?scheduleId=$scheduleId');
    var response = await client.get(
      uri,
      headers: _getHeaders(),
    );

    print(response.request?.contentLength);
    print(response.body);
    print(response.headers.toString());

    if (response.statusCode == 200) {
      var parsed = json.decode(response.body);
      return RemoteSuccess(parsed["id"] as String);
    } else {
      return RemoteError(response.body);
    }
  }

  Future<RemoteResponse<List<EmptySchedules>>> getEmptySchedules() async {
    var resp = await cache.getOrSetAsync(_emptySchedulesKey,
        () => getWithSession("/schedule/listEmptySchedules"));

    if (resp is RemoteSuccess) {
      return RemoteSuccess(
          emptySchedulesFromJson((resp as RemoteSuccess).data));
    } else {
      return (resp as RemoteError) as RemoteResponse<List<EmptySchedules>>;
    }
  }

  void invalidateEmptySchedules() {
    cache.invalidate(_emptySchedulesKey);
  }

  Future<RemoteResponse<Schedule>> createAppointment(
      AppointRequest data) async {
    var uri = Uri.parse('$urlBase/schedule/appoint');
    var response = await client.post(
      uri,
      headers: {"Content-Type": "application/json", ..._getHeaders()},
      body: appointRequestToJson(data),
    );

    print(response.request?.contentLength);
    print(response.body);
    print(response.headers.toString());

    if (response.statusCode == 200) {
      return RemoteSuccess(scheduleFromJson(response.body));
    } else {
      return RemoteError(response.body);
    }
  }

  Future<RemoteResponse<Session>> register(
      String username, String password) async {
    var uri = Uri.parse('$urlBase/register');
    var response = await client.post(
      uri,
      headers: {"Content-Type": "application/json", ..._getHeaders()},
      body: json.encode({"username": username, "password": password}),
    );

    print(response.request?.contentLength);
    print(response.body);
    print(response.headers.toString());

    if (response.statusCode == 200) {
      updateCookie(response);
      var parsed = json.decode(response.body);
      if (parsed["success"]) {
        return RemoteSuccess(sessionFromJson(parsed["session"]));
      } else {
        return RemoteError(parsed["error"]);
      }
    } else {
      return RemoteError(response.body);
    }
  }

  Future<RemoteResponse<Session>> login(
      String username, String password) async {
    var uri = Uri.parse('$urlBase/login');
    var response = await client.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: json.encode(
        {"username": username, "password": password},
      ),
    );

    print(response.body);
    print(response.headers.toString());

    if (response.statusCode == 200) {
      updateCookie(response);
      var parsed = json.decode(response.body);
      if (parsed["success"]) {
        return RemoteSuccess(sessionFromJson(parsed["session"]));
      } else {
        return RemoteError(parsed["error"]);
      }
    } else {
      return RemoteError(response.body);
    }
  }

  Future<RemoteResponse<String>> getWithSession(String endpoint) async {
    var uri = Uri.parse('$urlBase$endpoint');
    var response = await client.get(uri, headers: _getHeaders());
    print(response.body);

    if (response.statusCode == 200) {
      return RemoteSuccess(response.body);
    }

    return RemoteError(response.body);
  }

  Future<void> updateCookie(http.Response response) async {
    String? rawCookie = response.headers['set-cookie'];
    if (rawCookie != null) {
      int index = rawCookie.indexOf(';');
      this.sessionManager.setSession(
          (index == -1) ? rawCookie : rawCookie.substring(0, index));
    }
  }

  Map<String, String> _getHeaders() {
    return {"Cookie": sessionManager.getSession() ?? ""};
  }
}
