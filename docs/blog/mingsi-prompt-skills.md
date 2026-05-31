---
title: 明思技能包——AI 智能体 System Prompt 设计与优化实战指南
date: 2026-06-01
tags: [Prompt Engineering, System Prompt, Agent Optimization, mingsi-skills]
---

# 明思技能包——AI 智能体 System Prompt 设计与优化

构建一个优秀的 AI Agent，60% 的功夫在 Prompt 之上。System Prompt 就是 Agent 的“人格”和“操作手册”，它决定了 Agent 的行为范式、工作思维和输出质量。

[mingsi-skills](https://github.com/qingjian0/mingsi-skills) 是一套专注于 AI 智能体的结构化 Prompt 优化技能包，提供了完整的 System Prompt 设计框架和多种场景下的优化模板。

## System Prompt 的核心结构

一个好的 System Prompt 应该包含以下核心要素：

### 1. 角色定义（Role）

明确告诉 Agent 它是谁。不要只说“你是一个 AI 助手”，而是要精确定义其专业背景和职责范围。

```
# 差的示例
你是一个有用的 AI 助手。

# 好的示例
你是一名专业的前端架构师，精通 React/Vue 生态，
专注于性能优化和架构设计，有 8 年工作经验。
```

### 2. 能力边界（Capabilities）

明确告诉 Agent 它能做什么、不能做什么。这能有效降低幻觉率，避免 Agent 在不擅长的领域乱说。

### 3. 工作流程（Workflow）

定义 Agent 处理问题的标准流程。包括如何分析问题、如何调用工具、如何验证结果。

### 4. 输出格式（Output Format）

规范输出的结构和格式。可以是 JSON、Markdown、或按照特定模板。

### 5. 禁忌项（Constraints）

明确告诉 Agent 什么不能做。这比告诉它应该做什么同样重要。

## 实战模板

```markdown
# Agent 设计模板

## 角色
[Agent 的身份和专业背景]

## 职责
- 核心任务 1
- 核心任务 2

## 能力边界
- 可以做：[...]
- 不可以做：[...]

## 工作流程
1. 分析问题
2. 检索知识
3. 调用工具
4. 验证结果
5. 输出答案

## 输出规范
[JSON 格式或 Markdown 模板]
```

> 项目地址：[github.com/qingjian0/mingsi-skills](https://github.com/qingjian0/mingsi-skills)
