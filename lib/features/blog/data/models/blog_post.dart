import 'package:sqflite/sqflite.dart';

class BlogPost {
  final String? id;
  final String title;
  final String content;
  final String summary;
  final String? category;
  final List<String>? tags;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isDraft;

  BlogPost({
    this.id,
    required this.title,
    required this.content,
    this.summary = '',
    this.category,
    this.tags,
    DateTime? createdAt,
    this.updatedAt,
    this.isDraft = false,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'summary': summary,
      'category': category,
      'tags': tags?.join(','),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'isDraft': isDraft ? 1 : 0,
    };
  }

  factory BlogPost.fromMap(Map<String, dynamic> map) {
    return BlogPost(
      id: map['id'] as String?,
      title: map['title'] as String,
      content: map['content'] as String,
      summary: map['summary'] as String? ?? '',
      category: map['category'] as String?,
      tags: map['tags'] != null ? (map['tags'] as String).split(',') : null,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: map['updatedAt'] != null
          ? DateTime.parse(map['updatedAt'] as String)
          : null,
      isDraft: (map['isDraft'] as int?) == 1,
    );
  }

  BlogPost copyWith({
    String? id,
    String? title,
    String? content,
    String? summary,
    String? category,
    List<String>? tags,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isDraft,
  }) {
    return BlogPost(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      summary: summary ?? this.summary,
      category: category ?? this.category,
      tags: tags ?? this.tags,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isDraft: isDraft ?? this.isDraft,
    );
  }

  String get excerpt {
    if (summary.isNotEmpty) return summary;
    if (content.length <= 200) return content;
    return content.substring(0, 200) + '...';
  }
}
