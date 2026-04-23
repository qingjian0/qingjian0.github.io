import 'package:flutter/material.dart';
import 'package:workspace/features/chat/presentation/widgets/webview_container.dart';

class ChatScreen extends StatelessWidget {
  final String modelName;
  final String url;
  
  const ChatScreen({super.key, required this.modelName, required this.url});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(modelName),
      ),
      body: WebViewContainer(url: url),
    );
  }
}