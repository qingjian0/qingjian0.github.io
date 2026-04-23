import 'dart:convert';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:workspace/core/security/aes_crypto_service.dart';
import 'package:workspace/core/utils/file_lock_queue.dart';

class MemoryLocalDataSource {
  final FileLockQueue _fileLockQueue = FileLockQueue();
  late Directory _memoryDir;
  late Directory _encryptedMemoryDir;
  
  Future<void> init() async {
    final appDir = await getApplicationDocumentsDirectory();
    _memoryDir = Directory('${appDir.path}/memory');
    _encryptedMemoryDir = Directory('${appDir.path}/memory_encrypted');
    
    await _memoryDir.create(recursive: true);
    await _encryptedMemoryDir.create(recursive: true);
  }
  
  Future<void> saveMemory(String content, {bool encrypted = false, String? password}) async {
    final dir = encrypted ? _encryptedMemoryDir : _memoryDir;
    final filename = 'memory_${DateTime.now().millisecondsSinceEpoch}.json';
    final file = File('${dir.path}/$filename');
    
    Map<String, dynamic> memoryData = {
      'content': content,
      'createdAt': DateTime.now().toIso8601String(),
    };
    
    String dataToWrite;
    if (encrypted && password != null) {
      final cryptoService = AesCryptoService();
      cryptoService.init(password);
      dataToWrite = cryptoService.encrypt(json.encode(memoryData));
    } else {
      dataToWrite = json.encode(memoryData);
    }
    
    await _fileLockQueue.withLock(file.path, () async {
      await file.writeAsString(dataToWrite);
    });
  }
  
  Future<List<Map<String, dynamic>>> getMemories({bool encrypted = false, String? password}) async {
    final dir = encrypted ? _encryptedMemoryDir : _memoryDir;
    final files = await dir.list().toList();
    final memories = <Map<String, dynamic>>[];
    
    for (var file in files) {
      if (file is File) {
        try {
          final content = await _fileLockQueue.withLock(file.path, () async {
            return await file.readAsString();
          });
          
          Map<String, dynamic> memoryData;
          if (encrypted && password != null) {
            final cryptoService = AesCryptoService();
            cryptoService.init(password);
            final decryptedContent = cryptoService.decrypt(content);
            memoryData = json.decode(decryptedContent);
          } else {
            memoryData = json.decode(content);
          }
          
          memories.add(memoryData);
        } catch (e) {
          print('Failed to read memory file: $e');
        }
      }
    }
    
    // 按创建时间排序
    memories.sort((a, b) => b['createdAt'].compareTo(a['createdAt']));
    return memories;
  }
  
  Future<void> deleteMemory(String filename, {bool encrypted = false}) async {
    final dir = encrypted ? _encryptedMemoryDir : _memoryDir;
    final file = File('${dir.path}/$filename');
    
    if (await file.exists()) {
      await _fileLockQueue.withLock(file.path, () async {
        await file.delete();
      });
    }
  }
  
  Future<void> convertPlainToEncrypted(String password) async {
    final plainMemories = await getMemories(encrypted: false);
    
    for (var memory in plainMemories) {
      await saveMemory(memory['content'], encrypted: true, password: password);
      // 这里可以添加删除原明文文件的逻辑
    }
  }
  
  Future<void> convertEncryptedToPlain(String password) async {
    final encryptedMemories = await getMemories(encrypted: true, password: password);
    
    for (var memory in encryptedMemories) {
      await saveMemory(memory['content'], encrypted: false);
      // 这里可以添加删除原加密文件的逻辑
    }
  }
}