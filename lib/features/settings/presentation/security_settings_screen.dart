import 'package:flutter/material.dart';
import 'package:workspace/features/memory/data/memory_local_ds.dart';

class SecuritySettingsScreen extends StatefulWidget {
  const SecuritySettingsScreen({super.key});
  
  @override
  State<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends State<SecuritySettingsScreen> {
  final MemoryLocalDataSource _memoryDs = MemoryLocalDataSource();
  final TextEditingController _passwordController = TextEditingController();
  bool _isConverting = false;
  double _conversionProgress = 0.0;
  
  Future<void> _convertPlainToEncrypted() async {
    if (_passwordController.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('密码长度至少6位')),
      );
      return;
    }
    
    setState(() {
      _isConverting = true;
      _conversionProgress = 0.0;
    });
    
    try {
      await _memoryDs.init();
      await _memoryDs.convertPlainToEncrypted(_passwordController.text);
      
      setState(() {
        _conversionProgress = 1.0;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('转换完成')),
      );
    } catch (e) {
      print('转换失败: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('转换失败')),
      );
    } finally {
      setState(() {
        _isConverting = false;
      });
    }
  }
  
  Future<void> _convertEncryptedToPlain() async {
    if (_passwordController.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('密码长度至少6位')),
      );
      return;
    }
    
    setState(() {
      _isConverting = true;
      _conversionProgress = 0.0;
    });
    
    try {
      await _memoryDs.init();
      await _memoryDs.convertEncryptedToPlain(_passwordController.text);
      
      setState(() {
        _conversionProgress = 1.0;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('转换完成')),
      );
    } catch (e) {
      print('转换失败: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('转换失败')),
      );
    } finally {
      setState(() {
        _isConverting = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('安全设置'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: '密码',
                hintText: '请输入密码（至少6位）',
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isConverting ? null : _convertPlainToEncrypted,
              child: Text('明文转加密'),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: _isConverting ? null : _convertEncryptedToPlain,
              child: Text('加密转明文'),
            ),
            SizedBox(height: 20),
            if (_isConverting)
              Column(
                children: [
                  LinearProgressIndicator(value: _conversionProgress),
                  SizedBox(height: 10),
                  Text('转换中...'),
                ],
              ),
          ],
        ),
      ),
    );
  }
}