import 'package:flutter/material.dart';
import 'package:workspace/features/blog/data/models/blog_post.dart';
import 'package:workspace/features/blog/data/blog_local_datasource.dart';
import 'package:workspace/core/utils/markdown_formatter.dart';

class BlogEditorScreen extends StatefulWidget {
  final BlogPost? post;

  const BlogEditorScreen({super.key, this.post});

  @override
  State<BlogEditorScreen> createState() => _BlogEditorScreenState();
}

class _BlogEditorScreenState extends State<BlogEditorScreen> {
  final BlogLocalDataSource _dataSource = BlogLocalDataSource();
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _summaryController = TextEditingController();
  final _categoryController = TextEditingController();
  final _tagsController = TextEditingController();
  bool _isDraft = false;
  bool _isPreviewMode = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.post != null) {
      _titleController.text = widget.post!.title;
      _contentController.text = widget.post!.content;
      _summaryController.text = widget.post!.summary;
      _categoryController.text = widget.post!.category ?? '';
      _tagsController.text = widget.post!.tags?.join(', ') ?? '';
      _isDraft = widget.post!.isDraft;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _summaryController.dispose();
    _categoryController.dispose();
    _tagsController.dispose();
    super.dispose();
  }

  Future<void> _savePost({bool asDraft = false}) async {
    if (_formKey.currentState?.validate() != true) {
      return;
    }

    setState(() => _isSaving = true);

    try {
      final tags = _tagsController.text
          .split(',')
          .map((t) => t.trim())
          .where((t) => t.isNotEmpty)
          .toList();

      final post = BlogPost(
        id: widget.post?.id,
        title: _titleController.text,
        content: _contentController.text,
        summary: _summaryController.text,
        category: _categoryController.text.isEmpty ? null : _categoryController.text,
        tags: tags.isEmpty ? null : tags,
        isDraft: asDraft || _isDraft,
        createdAt: widget.post?.createdAt,
        updatedAt: widget.post != null ? DateTime.now() : null,
      );

      if (widget.post == null) {
        await _dataSource.createBlogPost(post);
      } else {
        await _dataSource.updateBlogPost(post);
      }

      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('保存失败：$e')),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.post == null ? '新建文章' : '编辑文章'),
        actions: [
          if (!_isPreviewMode) ...[
            IconButton(
              icon: const Icon(Icons.visibility),
              tooltip: '预览',
              onPressed: () {
                setState(() => _isPreviewMode = true);
              },
            ),
            TextButton(
              onPressed: _isSaving ? null : () => _savePost(asDraft: true),
              child: _isSaving
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('保存草稿'),
            ),
            ElevatedButton(
              onPressed: _isSaving ? null : () => _savePost(),
              child: _isSaving
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('发布'),
            ),
            const SizedBox(width: 8),
          ],
          if (_isPreviewMode)
            IconButton(
              icon: const Icon(Icons.edit),
              tooltip: '编辑',
              onPressed: () {
                setState(() => _isPreviewMode = false);
              },
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: _isPreviewMode ? _buildPreview() : _buildEditor(),
      ),
    );
  }

  Widget _buildEditor() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextFormField(
          controller: _titleController,
          decoration: const InputDecoration(
            labelText: '标题',
            border: OutlineInputBorder(),
            hintText: '请输入文章标题',
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '请输入标题';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _summaryController,
          decoration: const InputDecoration(
            labelText: '摘要（可选）',
            border: OutlineInputBorder(),
            hintText: '简要描述文章内容',
            alignLabelWithHint: true,
          ),
          maxLines: 2,
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _categoryController,
                decoration: const InputDecoration(
                  labelText: '分类（可选）',
                  border: OutlineInputBorder(),
                  hintText: '输入分类名称',
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: TextFormField(
                controller: _tagsController,
                decoration: const InputDecoration(
                  labelText: '标签（可选，逗号分隔）',
                  border: OutlineInputBorder(),
                  hintText: '标签1, 标签2, 标签3',
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SwitchListTile(
          title: const Text('保存为草稿'),
          subtitle: const Text('草稿不会在博客列表中显示'),
          value: _isDraft,
          onChanged: (value) {
            setState(() => _isDraft = value);
          },
        ),
        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 16),
        const Text(
          '内容（支持 Markdown）',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        _buildMarkdownToolbar(),
        const SizedBox(height: 8),
        TextFormField(
          controller: _contentController,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: '开始写作...',
          ),
          maxLines: 20,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '请输入文章内容';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildMarkdownToolbar() {
    return Wrap(
      spacing: 4,
      children: [
        _MarkdownButton(
          icon: Icons.title,
          tooltip: '标题',
          onPressed: () => _insertText('# '),
        ),
        _MarkdownButton(
          icon: Icons.format_bold,
          tooltip: '粗体',
          onPressed: () => _wrapText('**', '**'),
        ),
        _MarkdownButton(
          icon: Icons.format_italic,
          tooltip: '斜体',
          onPressed: () => _wrapText('*', '*'),
        ),
        _MarkdownButton(
          icon: Icons.format_strikethrough,
          tooltip: '删除线',
          onPressed: () => _wrapText('~~', '~~'),
        ),
        const SizedBox(width: 4),
        _MarkdownButton(
          icon: Icons.format_list_bulleted,
          tooltip: '无序列表',
          onPressed: () => _insertText('- '),
        ),
        _MarkdownButton(
          icon: Icons.format_list_numbered,
          tooltip: '有序列表',
          onPressed: () => _insertText('1. '),
        ),
        _MarkdownButton(
          icon: Icons.checklist,
          tooltip: '任务列表',
          onPressed: () => _insertText('- [ ] '),
        ),
        const SizedBox(width: 4),
        _MarkdownButton(
          icon: Icons.link,
          tooltip: '链接',
          onPressed: () => _wrapText('[链接文本](', ')'),
        ),
        _MarkdownButton(
          icon: Icons.image,
          tooltip: '图片',
          onPressed: () => _wrapText('![图片描述](', ')'),
        ),
        _MarkdownButton(
          icon: Icons.code,
          tooltip: '行内代码',
          onPressed: () => _wrapText('`', '`'),
        ),
        _MarkdownButton(
          icon: Icons.code_outlined,
          tooltip: '代码块',
          onPressed: () => _insertText('\n```\n\n```\n'),
        ),
        _MarkdownButton(
          icon: Icons.horizontal_rule,
          tooltip: '分割线',
          onPressed: () => _insertText('\n---\n'),
        ),
        _MarkdownButton(
          icon: Icons.format_quote,
          tooltip: '引用',
          onPressed: () => _insertText('> '),
        ),
      ],
    );
  }

  Widget _buildPreview() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.grey[100],
          child: const Row(
            children: [
              Icon(Icons.visibility, color: Colors.grey),
              SizedBox(width: 8),
              Text(
                '预览模式',
                style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        if (_titleController.text.isNotEmpty)
          Text(
            _titleController.text,
            style: Theme.of(context).textTheme.headlineMedium,
          ),
        if (_summaryController.text.isNotEmpty) ...[
          const SizedBox(height: 16),
          Text(
            _summaryController.text,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.grey[600],
                  fontStyle: FontStyle.italic,
                ),
          ),
        ],
        const SizedBox(height: 16),
        if (_categoryController.text.isNotEmpty || _tagsController.text.isNotEmpty)
          Row(
            children: [
              if (_categoryController.text.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    _categoryController.text,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                    ),
                  ),
                ),
              if (_tagsController.text.isNotEmpty) ...[
                const SizedBox(width: 8),
                ..._tagsController.text
                    .split(',')
                    .map((t) => t.trim())
                    .where((t) => t.isNotEmpty)
                    .map((tag) => Padding(
                          padding: const EdgeInsets.only(right: 4),
                          child: Chip(label: Text(tag)),
                        )),
              ],
            ],
          ),
        const SizedBox(height: 24),
        const Divider(),
        const SizedBox(height: 24),
        if (_contentController.text.isNotEmpty)
          MarkdownFormatter.formatMarkdown(_contentController.text)
        else
          Center(
            child: Text(
              '暂无内容',
              style: TextStyle(color: Colors.grey[400]),
            ),
          ),
      ],
    );
  }

  void _insertText(String text) {
    final selection = _contentController.selection;
    final newText = _contentController.text.replaceRange(
      selection.start,
      selection.end,
      text,
    );
    _contentController.value = TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(
        offset: selection.start + text.length,
      ),
    );
  }

  void _wrapText(String prefix, String suffix) {
    final selection = _contentController.selection;
    final selectedText = _contentController.text.substring(
      selection.start,
      selection.end,
    );
    final newText = _contentController.text.replaceRange(
      selection.start,
      selection.end,
      '$prefix$selectedText$suffix',
    );
    _contentController.value = TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(
        offset: selection.start + prefix.length + selectedText.length,
      ),
    );
  }
}

class _MarkdownButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onPressed;

  const _MarkdownButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon, size: 20),
      tooltip: tooltip,
      onPressed: onPressed,
      constraints: const BoxConstraints(),
      padding: const EdgeInsets.all(8),
      visualDensity: VisualDensity.compact,
    );
  }
}
