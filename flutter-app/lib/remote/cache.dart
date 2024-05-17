import 'package:flutter/foundation.dart';

class Cache {
  Cache();
  final Map<String, CacheEntry<Object>> cache = {};

  T? get<T>(String key) {
    print("[Cache] get $key");
    if (cache.containsKey(key)) {
      print("[Cache] found $key");
      CacheEntry<Object> entry = cache[key]!;
      print("[Cache] expires ${entry.expires}, now ${FlutterTimeline.now}");
      if (FlutterTimeline.now < entry.expires) {
        print("[Cache] using cache");
        return entry.value as T;
      }

      print("[Cache] remove $key");
      cache.remove(key);
    }

    return null;
  }

  T getOrSet<T>(String key, T Function() getter, { int expiresMs = 1800000 }) {
    print("[Cache] getOrSet $key");
    T? value = get(key);
    if (value == null) {
      print("[Cache] set $key");
      value = getter();
      set(key, getter(), expiresMs: expiresMs);
      return value!;
    }
    return value;
  }

  Future<T> getOrSetAsync<T>(String key, Future<T> Function() getter, { int expiresMs = 1800000 }) async {
    print("[Cache] getOrSetAsync $key");
    T? value = get(key);
    if (value == null) {
      print("[Cache] set $key");
      value = await getter();
      set(key, value, expiresMs: expiresMs);
      return value!;
    }

    return value;
  }

  set<T>(String key, T value, { int expiresMs = 1800000 }) {
    print("[Cache] set $key, expiry $expiresMs");
    cache[key] = CacheEntry(value as Object, FlutterTimeline.now + expiresMs * 1000);
  }

  invalidate(String key) {
    print("[Cache] invalidate $key");
    cache.remove(key);
  }
}

class CacheEntry<T> {
  const CacheEntry(this.value, this.expires);

  final T value;
  final int expires; // make sure to use FlutterTimeline.now
}
