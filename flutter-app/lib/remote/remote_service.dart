import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'cache.dart';

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
  final SessionManager sessionManager = new SessionManager();

  static const _emptySchedulesKey = "emptySchedules";

  Future<RemoteResponse<List<Product>>> getProducts() async {
    var resp = await cache.getOrSetAsync(_productsKey,
        () => getWithSession("/shop/list-product?shopId=$shopId"));

    if (resp is RemoteSuccess) {
      return RemoteSuccess(productFromJson((resp as RemoteSuccess).data));
    } else {
      return (resp as RemoteError) as RemoteResponse<List<Product>>;
    }
  }
  void invalidateEmptySchedules() {
    cache.invalidate(_emptySchedulesKey);
  }

  /// Takes a list of int (productIds) that refers to quantity.
  Future<RemoteResponse<Appointment>> createAppointment(
      List<Quantity<int>> productIds) async {
    var uri = Uri.parse('$urlBase/transaction/create');
    var response = await client.post(
      uri,
      headers: {"Content-Type": "application/json", ..._getHeaders()},
      body: json.encode({
        "shopId": shopId,
        "items": productIds
            .map((q) => {"productId": q.product, "quantity": q.quantity})
            .toList()
      }),
    );

    print(response.request?.contentLength);
    print(response.body);
    print(response.headers.toString());

    if (response.statusCode == 200) {
      return RemoteSuccess(transactionFromJson(response.body));
    } else {
      return RemoteError(response.body);
    }
  }

  Future<RemoteResponse<Session>> register(String username, String register) async {
    var uri = Uri.parse('$urlBase/register');
    var response = await client.post(
      uri,
      headers: {"Content-Type": "application/json", ..._getHeaders()},
      body: json.encode({
        "username": username,
        "password": password
      }),
    );

    print(response.request?.contentLength);
    print(response.body);
    print(response.headers.toString());

    if (response.statusCode == 200) {
      const parsed = json.decode(response.body);
      if (parsed["success"]) {
        sessionManager.setSession(parsed["data"]["session"]);
        return RemoteSuccess();
      } else {
        return RemoteError("Failed to register");
      }
    } else {
      return RemoteError(response.body);
    }
  }

  Future<RemoteResponse<void>> login(String username, String password) async {
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
      return RemoteSuccess(null);
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
      sessionManager.setSession((index == -1) ? rawCookie : rawCookie.substring(0, index));
    }
  }

  String _getHeaders() {
    return {"Cookie": sessionManager.getSession() ?? ""};
  }
}
