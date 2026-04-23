import 'dart:async';

class FileLockQueue {
  final Map<String, Completer<void>> _locks = {};
  
  Future<void> acquireLock(String filePath) async {
    while (_locks.containsKey(filePath)) {
      await _locks[filePath]!.future;
    }
    
    _locks[filePath] = Completer<void>();
  }
  
  void releaseLock(String filePath) {
    if (_locks.containsKey(filePath)) {
      _locks[filePath]!.complete();
      _locks.remove(filePath);
    }
  }
  
  Future<T> withLock<T>(String filePath, Future<T> Function() operation) async {
    await acquireLock(filePath);
    try {
      return await operation();
    } finally {
      releaseLock(filePath);
    }
  }
}