import 'dart:convert';
import 'dart:typed_data';
import 'package:encrypt/encrypt.dart';

class AesCryptoService {
  late Encrypter _encrypter;
  late IV _iv;
  
  void init(String password) {
    final key = Key.fromUtf8(_deriveKey(password));
    _iv = IV.fromLength(16);
    _encrypter = Encrypter(AES(key, mode: AESMode.cbc));
  }
  
  String encrypt(String plainText) {
    final encrypted = _encrypter.encrypt(plainText, iv: _iv);
    return encrypted.base64;
  }
  
  String decrypt(String encryptedText) {
    final encrypted = Encrypted.fromBase64(encryptedText);
    return _encrypter.decrypt(encrypted, iv: _iv);
  }
  
  String _deriveKey(String password) {
    // 简单的密钥派生，实际应用中应该使用更安全的方法
    final bytes = utf8.encode(password);
    final padded = Uint8List(32);
    for (int i = 0; i < bytes.length && i < 32; i++) {
      padded[i] = bytes[i];
    }
    return utf8.decode(padded);
  }
}