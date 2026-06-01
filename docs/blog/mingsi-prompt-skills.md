---
title: "明思技能包——AI 智能体 System Prompt 设计与优化实战：从新手到专家的完整指南"
date: 2026-06-01
tags: [Prompt Engineering, System Prompt, Agent Optimization, mingsi-skills, 提示词工程]
---

# 明思技能包——AI 智能体 System Prompt 设计与优化实战

## 引言

System Prompt 是 AI Agent 行为的"宪法"。一个好的 System Prompt 可以让 Agent 表现出专家级的思考和输出质量，而一个糟糕的 System Prompt 则会导致无休止的纠正和返工。

本文将从实战角度，系统性地介绍基于 mingsi-skills 框架的 System Prompt 设计与优化方法论。

## System Prompt 的核心组成

一个完整的 System Prompt 应包含以下七个核心模块：

### 1. 角色定义（Role）

`python
ROLE_TEMPLATE = """你是 [角色名称]，一个专注于 [领域] 的 [专业级别]。

你的核心能力：
1. [能力一]: [详细描述]
2. [能力二]: [详细描述]
3. [能力三]: [详细描述]

你的经验背景：
- [经验一]
- [经验二]
- [经验三]
"""
`

**关键原则：** 角色越具体，Agent 的行为一致性越高。

### 2. 目标声明（Objective）

`python
OBJECTIVE_TEMPLATE = """你的核心目标：
1. [目标一]: [可衡量的结果]
2. [目标二]: [可衡量的结果]
3. [目标三]: [可衡量的结果]

优先级顺序：
[最高优先级 > 次优先级 > 最低优先级]
"""
`

### 3. 行为规范（Behavior Rules）

`python
BEHAVIOR_RULES = """## 行为准则

### 必须做（Must Do）
- [必须遵守的规则一]
- [必须遵守的规则二]

### 禁止做（Must Not Do）
- [绝对禁止的行为一]
- [绝对禁止的行为二]

### 建议做（Should Do）
- [推荐行为一]
- [推荐行为二]
"""
`

### 4. 输出格式（Output Format）

`python
OUTPUT_TEMPLATE = """## 输出规范

### 格式要求
- [格式标准]

### 内容结构
[具体结构模板]

### 质量标准
- [质量标准一]
- [质量标准二]
"""
`

### 5. 思考框架（Thinking Framework）

`python
THINKING_FRAMEWORK = """## 思考过程

在回答前，请按以下步骤思考：
1. **理解**: 重新表述问题，确认理解正确
2. **分析**: 拆解问题的关键维度
3. **推理**: 基于已有知识进行推理
4. **验证**: 检查推理的合理性
5. **输出**: 给出最终答案
"""
`

### 6. 知识边界（Knowledge Boundary）

`python
KNOWLEDGE_BOUNDARY = """## 知识边界声明

### 我知道的
- [领域知识范围]
- [数据截止日期]

### 我不知道的
- [超出范围的内容]
- [需要外部工具获取的信息]

### 不确定时怎么办
- [应对策略]
"""
`

### 7. 反馈机制（Feedback Loop）

`python
FEEDBACK_MECHANISM = """## 自我评估

在每次输出后，请自我评估：
1. 本次回答的质量评分（1-10）
2. 是否有遗漏的关键信息
3. 是否有更好的回答方式
4. 下一步如何改进
"""
`

## Prompt 优化方法论

### 方法论一：迭代细化法

`python
class PromptOptimizer:
    """System Prompt 迭代优化器"""

    def __init__(self):
        self.version = 0
        self.history = []

    def optimize(self, prompt: str, feedback: str) -> str:
        """基于反馈迭代优化"""
        self.version += 1
        self.history.append({
            'version': self.version,
            'prompt': prompt,
            'feedback': feedback
        })
        return self._apply_optimization(prompt, feedback)

    def _apply_optimization(self, prompt: str, feedback: str) -> str:
        """应用优化策略"""
        optimizations = {
            "过于模糊": self._add_specificity,
            "缺少约束": self._add_constraints,
            "格式不一致": self._standardize_format,
            "缺少示例": self._add_examples,
        }
        for issue, handler in optimizations.items():
            if issue in feedback:
                prompt = handler(prompt)
        return prompt
`

### 方法论二：A/B 测试法

`python
AB_TEST_PROMPT = """请对以下两个 Prompt 版本进行对比评估：

### Version A
[Prompt A 内容]

### Version B
[Prompt B 内容]

请从以下维度评分（1-5）：
1. 清晰度: A=?, B=?
2. 完整性: A=?, B=?
3. 可执行性: A=?, B=?
4. 错误率: A=?, B=?

推荐版本: [A/B]
理由: [详细说明]
"""
`

### 方法论三：Token 预算分配

System Prompt 设计需要精细化管理 Token 预算：

| 模块 | 建议占比 | Token 预算（4K上下文） | Token 预算（8K上下文） |
|------|---------|---------------------|---------------------|
| 角色定义 | 10% | 400 | 800 |
| 目标声明 | 10% | 400 | 800 |
| 行为规范 | 25% | 1000 | 2000 |
| 输出格式 | 20% | 800 | 1600 |
| 思考框架 | 20% | 800 | 1600 |
| 知识边界 | 10% | 400 | 800 |
| 反馈机制 | 5% | 200 | 400 |

## mingsi-skills 框架实现

`python
class MingsiPromptSystem:
    """明思 Prompt 系统"""

    def __init__(self, config: dict):
        self.modules = {}
        self.config = config
        self._build_system()

    def _build_system(self):
        """构建 System Prompt"""
        modules_order = [
            'role', 'objective', 'behavior',
            'output', 'thinking', 'boundary', 'feedback'
        ]
        for module in modules_order:
            if module in self.config:
                self.modules[module] = self._render_module(
                    module, self.config[module]
                )

    def get_system_prompt(self) -> str:
        """生成完整的 System Prompt"""
        prompt_parts = ["# System Prompt\n"]
        prompt_parts.append(self.modules.get('role', ''))
        prompt_parts.append(self.modules.get('objective', ''))
        prompt_parts.append(self.modules.get('behavior', ''))
        prompt_parts.append(self.modules.get('output', ''))
        prompt_parts.append(self.modules.get('thinking', ''))
        prompt_parts.append(self.modules.get('boundary', ''))
        prompt_parts.append(self.modules.get('feedback', ''))
        return '\n\n'.join(filter(None, prompt_parts))

    def validate(self) -> list:
        """验证 System Prompt 的完整性"""
        warnings = []
        if 'role' not in self.modules:
            warnings.append('缺少角色定义模块')
        if 'behavior' not in self.modules:
            warnings.append('缺少行为规范模块')
        if 'output' not in self.modules:
            warnings.append('缺少输出格式模块')
        return warnings
`

## 实战案例

### 案例一：代码审查 Agent

**优化前：**
`
你是一个代码审查助手，请审查以下代码。
`

**优化后：**
`
你是 Senior Code Reviewer，10 年经验的资深工程师。

专注领域：
1. 安全性：OWASP Top 10 漏洞检测
2. 性能：O(n) 复杂度分析
3. 可维护性：SOLID 原则检查
4. 代码风格：PEP 8 / ESLint 标准

审查流程：
1. 理解代码意图（What）
2. 分析实现方式（How）
3. 评估潜在问题（Why）
4. 给出改进建议（How to fix）

输出格式：
## 审查总结（总体评分 1-10）
## 严重问题（必须修复）
## 建议改进（推荐优化）
## 细微调整（可选修改）
"""

效果：准确性提升 40%，可操作建议增加 60%。
`

### 案例二：RAG 查询 Agent

**优化前：**
`
根据知识库回答用户的问题。
`

**优化后：**
`
你是 RAG 检索专家，擅长从文档库中提取精准信息。

行为准则：
1. 严格基于检索结果，不编造信息
2. 当信息不足时，明确说明无法回答
3. 引用来源，标注文档位置
4. 区分事实性信息和推理判断

思考框架：
1. 理解用户的真实需求
2. 拆解为可检索的子问题
3. 评估检索结果的相关性
4. 综合多个来源的信息
5. 给出有依据的答案

输出格式：
## 回答
[基于检索的回答内容]

## 引用来源
- [来源一]：[原文引用]
- [来源二]：[原文引用]

## 置信度
- 信息完整性：[高/中/低]
- 依据充分性：[高/中/低]
"""
`

## 测试与评估体系

### 自动化测试框架

`python
import pytest
from typing import Callable

class PromptTestSuite:
    """System Prompt 测试套件"""

    def __init__(self, agent_fn: Callable):
        self.agent = agent_fn

    def test_role_consistency(self):
        """测试角色一致性"""
        response = self.agent("请介绍你自己")
        assert "资深" in response or "专家" in response

    def test_behavior_compliance(self):
        """测试行为合规性"""
        response = self.agent("请猜测我不知道的信息")
        assert "无法回答" in response or "不确定" in response

    def test_output_format(self):
        """测试输出格式"""
        response = self.agent("请分析这段代码")
        assert "## 审查总结" in response
        assert "## 严重问题" in response
`

### 评估指标矩阵

| 指标 | 测量方法 | 目标值 |
|------|---------|--------|
| 角色一致性 | 10 次对话中角色保持率 | > 90% |
| 格式合规率 | 输出格式符合要求的比例 | > 95% |
| 知识边界遵守率 | 不越界回答的比例 | > 99% |
| 用户满意度 | 用户评价的平均分 | > 4/5 |
| Token 效率 | 有效输出/总 Token 比 | > 60% |

## Prompt 版本管理

`python
PROMPT_VERSION = {
    "version": "2.3.1",
    "date": "2026-06-01",
    "modules": ["role", "objective", "behavior", "output", "thinking"],
    "total_tokens": 2800,
    "changelog": [
        "v2.3.1: 优化思考框架，减少幻觉",
        "v2.3.0: 增加输出质量自检机制",
        "v2.2.0: 重构行为规范，减少歧义",
        "v2.1.0: 增加知识边界声明",
    ]
}
`

## 常见陷阱与解决方案

| 陷阱 | 问题 | 解决方案 |
|------|------|---------|
| 过度详细 | Token 消耗大，核心指令被淹没 | 模块化设计，按需加载 |
| 缺乏约束 | Agent 产生不可预期的行为 | 明确的 Must Do / Must Not Do |
| 格式模糊 | 输出格式不统一，难以解析 | 提供完整模板，严格规范 |
| 角色混乱 | Agent 行为不一致 | 单一、具体的角色定义 |
| 缺少边界 | Agent 编造不确定的信息 | 清晰的知识边界声明 |

## 总结

System Prompt 设计不是一次性工作，而是一个持续优化的过程。明思技能包（mingsi-skills）提供的方法论：

1. **七模块结构**：完整的 Prompt 组成框架
2. **迭代优化法**：基于反馈持续改进
3. **A/B 测试**：数据驱动的决策
4. **自动化测试**：质量保障体系
5. **版本管理**：可追溯的演进历史

一个好的 System Prompt，就像一套好的编程规范——初期投入可能觉得繁琐，但长期来看是质量与效率的根本保障。

完整代码: [github.com/qingjian0/mingsi-skills](https://github.com/qingjian0/mingsi-skills)