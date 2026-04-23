class MarkdownFormatter {
  static String formatChatMessage(String content) {
    // 简单的 Markdown 格式化
    String result = content;
    
    // 处理代码块
    result = _formatCodeBlocks(result);
    
    // 处理粗体
    result = _formatBold(result);
    
    // 处理斜体
    result = _formatItalic(result);
    
    // 处理链接
    result = _formatLinks(result);
    
    return result;
  }
  
  static String _formatCodeBlocks(String content) {
    // 简单的代码块处理
    return content.replaceAllMapped(
      RegExp(r'```(\w*)\n([\s\S]*?)```'),
      (match) => '<pre><code class="language-${match.group(1) ?? ''}">${match.group(2)}</code></pre>',
    );
  }
  
  static String _formatBold(String content) {
    return content.replaceAllMapped(
      RegExp(r'\*\*(.*?)\*\*'),
      (match) => '<strong>${match.group(1)}</strong>',
    );
  }
  
  static String _formatItalic(String content) {
    return content.replaceAllMapped(
      RegExp(r'\*(.*?)\*'),
      (match) => '<em>${match.group(1)}</em>',
    );
  }
  
  static String _formatLinks(String content) {
    return content.replaceAllMapped(
      RegExp(r'\[([^\]]+)\]\(([^\)]+)\)'),
      (match) => '<a href="${match.group(2)}">${match.group(1)}</a>',
    );
  }
}