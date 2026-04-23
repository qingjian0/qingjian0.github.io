import 'package:flutter/foundation.dart';
import 'package:webview_flutter/webview_flutter.dart';

class WebViewPoolProvider extends ChangeNotifier {
  final List<WebViewController> _pool = [];
  final Map<WebViewController, String> _controllerUrls = {};
  final int _maxPoolSize = 2;
  
  WebViewController getOrCreateController(String url) {
    // 查找是否已有对应 URL 的控制器
    for (var controller in _pool) {
      if (_controllerUrls[controller] == url) {
        // 将使用的控制器移到列表末尾（LRU 机制）
        _pool.remove(controller);
        _pool.add(controller);
        return controller;
      }
    }
    
    // 如果池已满，移除最久未使用的控制器
    if (_pool.length >= _maxPoolSize) {
      final removedController = _pool.removeAt(0);
      _controllerUrls.remove(removedController);
    }
    
    // 创建新的控制器
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse(url));
    
    _pool.add(controller);
    _controllerUrls[controller] = url;
    notifyListeners();
    return controller;
  }
  
  void clearPool() {
    _pool.clear();
    _controllerUrls.clear();
    notifyListeners();
  }
  
  int get poolSize => _pool.length;
}