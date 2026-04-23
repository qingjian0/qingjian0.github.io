import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:workspace/core/network/js_hot_update_service.dart';
import 'package:workspace/features/chat/presentation/widgets/skeleton_screen.dart';

class WebViewContainer extends StatefulWidget {
  final String url;
  
  const WebViewContainer({super.key, required this.url});
  
  @override
  State<WebViewContainer> createState() => _WebViewContainerState();
}

class _WebViewContainerState extends State<WebViewContainer> {
  late WebViewController _controller;
  bool _isLoading = true;
  final JsHotUpdateService _jsUpdateService = JsHotUpdateService();
  
  @override
  void initState() {
    super.initState();
    _initializeController();
  }
  
  void _initializeController() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (url) {
            _injectScripts();
            setState(() {
              _isLoading = false;
            });
          },
        ),
      )
      ..addJavaScriptChannel(
        'AiZhishuBridge',
        onMessageReceived: (message) {
          _handleJsMessage(message);
        },
      )
      ..loadRequest(Uri.parse(widget.url));
  }
  
  Future<void> _injectScripts() async {
    try {
      final fetchHookScript = await _jsUpdateService.fetchFetchHookScript();
      await _controller.runJavaScript(fetchHookScript);
    } catch (e) {
      print('Failed to inject scripts: $e');
    }
  }
  
  void _handleJsMessage(JavaScriptMessage message) {
    print('JS Message: ${message.message}');
    // 处理来自 JS 的消息
  }
  
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_isLoading)
          SkeletonScreen(),
      ],
    );
  }
}