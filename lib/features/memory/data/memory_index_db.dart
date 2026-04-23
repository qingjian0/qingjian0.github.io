import 'dart:io';
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';

class MemoryIndexDb {
  late Database _db;
  
  Future<void> init() async {
    final appDir = await getApplicationDocumentsDirectory();
    final dbPath = path.join(appDir.path, 'memory_index.db');
    
    _db = await openDatabase(
      dbPath,
      version: 1,
      onCreate: (db, version) {
        return db.execute('''
          CREATE TABLE memory_index (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            encrypted INTEGER NOT NULL DEFAULT 0
          );
          CREATE INDEX idx_memory_created_at ON memory_index(created_at);
          CREATE VIRTUAL TABLE memory_fts USING FTS5(
            content,
            tokenize="porter"
          );
        ''');
      },
    );
  }
  
  Future<void> addMemory(String filename, String content, String createdAt, bool encrypted) async {
    await _db.transaction((txn) async {
      await txn.insert(
        'memory_index',
        {
          'filename': filename,
          'content': content,
          'created_at': createdAt,
          'encrypted': encrypted ? 1 : 0,
        },
      );
      await txn.insert(
        'memory_fts',
        {'content': content},
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    });
  }
  
  Future<List<Map<String, dynamic>>> searchMemories(String query) async {
    return await _db.rawQuery('''
      SELECT mi.* FROM memory_index mi
      JOIN memory_fts mf ON mi.id = mf.rowid
      WHERE mf.content MATCH ?
      ORDER BY mi.created_at DESC
    ''', [query]);
  }
  
  Future<List<Map<String, dynamic>>> getAllMemories() async {
    return await _db.query(
      'memory_index',
      orderBy: 'created_at DESC',
    );
  }
  
  Future<void> deleteMemory(int id) async {
    await _db.transaction((txn) async {
      await txn.delete('memory_fts', where: 'rowid = ?', whereArgs: [id]);
      await txn.delete('memory_index', where: 'id = ?', whereArgs: [id]);
    });
  }
  
  Future<void> close() async {
    await _db.close();
  }
}