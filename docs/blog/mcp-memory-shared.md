---
title: 构建跨工具共享记忆系统：MCP 协议与向量检索实践
date: 2026-06-01
tags: [MCP, Agent, 记忆管理, 向量检索]
---

# 构建跨工具共享记忆系统

> 暂时性发现，我们看见了一个问题：Codex 里做的事，Claude 不知道；Cursor 里改的代码，Trae 重新理解。

这就是 [shared-memory-skill](https://github.com/qingjian0/shared-memory-skill) 项目的起点。

## 背景

当前 AI 编程助手越来越多，但每个工具都有自己的独立记忆。信息孤岛导致重复劳动、上下文丢失、效率低下。

## 架构设计

本项目采用了 5 层记忆阶层：

1. **缓存层** - 当前会话短期记忆
2. **会话层** - 历史会话记录
3. **项目层** - 项目级知识管理
4. **知识层** - FTS5 + 向量混合检索
5. **长期层** - 跨项目长期记忆

## MCP 协议集成

通过 MCP（Model Context Protocol）协议，将记忆系统披露为标准化服务。

> 项目地址：[github.com/qingjian0/shared-memory-skill](https://github.com/qingjian0/shared-memory-skill)
