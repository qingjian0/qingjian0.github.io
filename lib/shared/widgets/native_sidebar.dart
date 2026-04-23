import 'package:flutter/material.dart';
import 'package:workspace/core/constants/ai_urls.dart';
import 'package:workspace/features/chat/presentation/screens/chat_screen.dart';
import 'package:workspace/features/memory/presentation/memory_list_screen.dart';
import 'package:workspace/features/settings/presentation/security_settings_screen.dart';

class NativeSidebar extends StatelessWidget {
  final ValueChanged<int> onItemSelected;
  
  const NativeSidebar({super.key, required this.onItemSelected});
  
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: Colors.blue,
            ),
            child: Text(
              'AI 智枢',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
              ),
            ),
          ),
          ...AiUrls.models.entries.map((entry) {
            return ListTile(
              title: Text(entry.key),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ChatScreen(
                      modelName: entry.key,
                      url: entry.value,
                    ),
                  ),
                );
              },
            );
          }).toList(),
          Divider(),
          ListTile(
            title: Text('记忆管理'),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => MemoryListScreen(),
                ),
              );
            },
          ),
          ListTile(
            title: Text('安全设置'),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => SecuritySettingsScreen(),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}