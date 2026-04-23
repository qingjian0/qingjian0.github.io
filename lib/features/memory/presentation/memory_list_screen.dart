import 'package:flutter/material.dart';
import 'package:workspace/features/memory/data/memory_local_ds.dart';

class MemoryListScreen extends StatefulWidget {
  const MemoryListScreen({super.key});
  
  @override
  State<MemoryListScreen> createState() => _MemoryListScreenState();
}

class _MemoryListScreenState extends State<MemoryListScreen> {
  final MemoryLocalDataSource _memoryDs = MemoryLocalDataSource();
  List<Map<String, dynamic>> _memories = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadMemories();
  }
  
  Future<void> _loadMemories() async {
    try {
      await _memoryDs.init();
      final memories = await _memoryDs.getMemories();
      setState(() {
        _memories = memories;
        _isLoading = false;
      });
    } catch (e) {
      print('Failed to load memories: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('记忆列表'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _memories.isEmpty
              ? Center(child: Text('暂无记忆'))
              : ListView.builder(
                  itemCount: _memories.length,
                  itemBuilder: (context, index) {
                    final memory = _memories[index];
                    final content = memory['content'] as String;
                    final createdAt = DateTime.parse(memory['createdAt'] as String);
                    
                    return ListTile(
                      title: Text(
                        content.length > 50 ? '${content.substring(0, 50)}...' : content,
                        maxLines: 2,
                      ),
                      subtitle: Text(
                        '${createdAt.year}-${createdAt.month.toString().padLeft(2, '0')}-${createdAt.day.toString().padLeft(2, '0')} ${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}',
                      ),
                      onTap: () {
                        // 查看记忆详情
                      },
                    );
                  },
                ),
    );
  }
}