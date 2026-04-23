import 'package:flutter/material.dart';
import 'package:workspace/core/constants/ai_urls.dart';
import 'package:workspace/features/chat/presentation/screens/chat_screen.dart';
import 'package:workspace/shared/widgets/native_sidebar.dart';
import 'package:workspace/shared/widgets/model_switcher.dart';

class App extends StatefulWidget {
  const App({super.key});
  
  @override
  State<App> createState() => _AppState();
}

class _AppState extends State<App> {
  String _currentModel = AiUrls.models.keys.first;
  
  void _onModelChanged(String model) {
    setState(() {
      _currentModel = model;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI 智枢',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              Text('AI 智枢'),
              SizedBox(width: 20),
              ModelSwitcher(
                currentModel: _currentModel,
                onModelChanged: _onModelChanged,
              ),
            ],
          ),
        ),
        drawer: NativeSidebar(
          onItemSelected: (index) {
            // 处理侧边栏选择
          },
        ),
        body: ChatScreen(
          modelName: _currentModel,
          url: AiUrls.models[_currentModel]!,
        ),
      ),
    );
  }
}