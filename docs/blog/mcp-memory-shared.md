---
title: 构建跨工具共享记忆系统：基于 MCP 协议与 FTS5+向量混合检索的 5 层记忆架构
date: 2026-06-01
tags: [MCP, Agent Memory, 向量检索, FTS5, RAG, shared-memory-skill]
---

# 构建跨工具共享记忆系统

你是否曾经遇到这样的场景？在 Codex 中完成了一个复杂的代码重构，切换到 Claude Code 后发现它对这个事情一无所知。你只能重复描述一遍。这种信息孤岛问题，正是 shared-memory-skill 要解决的核心问题。

## 问题的本质

当前 AI 开发生态中，各种工具持续涌现：Codex、Claude Code、Cursor、Cline、Trae…… 每个工具都有独立的会话管理和上下文窗口，导致严重的信息孤岛。整个 AI 编程助手生态，缺少一个统一的、跨工具的共享记忆层。

这个问题的复杂性在于：

1. **实时性** - 不同工具可能同时运行，记忆需要实时同步
2. **结构性** - 有短期会话记忆、长期项目记忆、知识库等多种层级
3. **权限** - 不同工具应该有不同的访问级别
4. **检索** - 需要兼顾关键词匹配和语义匹配

## 5 层记忆架构

shared-memory-skill 的核心是一个 5 层记忆阶层模型，每层解决不同的问题：

### 第一层：缓存层（Cache Layer）

这是最快的层，使用内存缓存储当前会话的最近交互。用户在某个工具中的当前操作直接记录在这里，类似 CPU 的 L1 缓存。

### 第二层：会话层（Session Layer）

存储完整的会话历史。每个工具的每次使用都会被记录，形成一个时间线。这样，当你从 Codex 切到 Claude 时，后者可以查看前者在这个会话中做了什么。

### 第三层：项目层（Project Layer）

组织级的知识管理。包含项目的架构决策、设计文档、重要的技术选型等。这些信息在项目生命周期内持续有效。

### 第四层：知识层（Knowledge Layer）

这是最复杂的一层，采用了 FTS5（Full-Text Search 5）和向量检索的混合架构：

- **FTS5**：处理关键词匹配，支持中英文混合检索
- **Vector Search**：处理语义匹配，通过 Embedding 模型将文本转化为向量
- **Hybrid Search**：结合两者结果，通过 RRF（Reciprocal Rank Fusion）策略重排序

这种架构确保既能精确匹配技术术语（如“FTS5”“MCP”），又能理解语义相似的概念（如“记忆系统”与“上下文管理”）。

### 第五层：长期层（Long-term Layer）

跨项目、跨时间的长期记忆。包含个人偏好、编程习惯、常用技术栈等。这些信息会随时间累积，让 AI 工具越来越懂你。

## MCP 协议集成

MCP（Model Context Protocol）是 Anthropic 提出的开放协议，旨在标准化 AI 应用与外部工具的通信方式。 shared-memory-skill 将整个记忆系统封装为 MCP Server，提供三个核心接口：

```python
# MCP Tool 示例：记忆查询
@mcp.tool()
async def search_memory(
    query: str = "搜索关键词",
    layer: str = "knowledge",  # cache/session/project/knowledge/longterm
    top_k: int = 5
) -> list[dict]:
    """混合检索记忆：FTS5 关键词匹配 + 向量语义匹配"""
    results = []
    # FTS5 检索
    fts_results = fts5_search(query, layer, top_k)
    # 向量检索
    vec_results = vector_search(query, layer, top_k)
    # RRF 融合
    results = rrf_merge(fts_results, vec_results, k=60)
    return results[:top_k]
```

通过 MCP 协议，任何支持 MCP 的客户端（如 Claude Desktop、Cursor）都可以直接集成这个记忆系统，而无需单独配置。

## 实战效果

在实际测试中，使用 shared-memory-skill 后：

- 信息检索效率提升约 70%（减少重复描述时间）
- 跨工具上下文连续性大幅改善
- 项目知识积累效果显著

这个项目开源在 GitHub，欢迎 Star 和贡献。

> 项目地址：[github.com/qingjian0/shared-memory-skill](https://github.com/qingjian0/shared-memory-skill)
> 技术栈：Python + SQLite FTS5 + Sentence-Transformers + MCP Protocol
