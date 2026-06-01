---
title: "明思技能包——AI 智能体 System Prompt 设计与优化实战指南"
date: 2026-06-01
tags: [Prompt Engineering, System Prompt, Agent Optimization, mingsi-skills]
---

# 明思技能包——AI 智能体 System Prompt 设计与优化实战

## 引言

System Prompt 是 AI Agent 行为的"宪法"。一个好的 System Prompt 让 Agent 表现出专家级的输出质量；一个糟糕的 Prompt 则导致无休止的纠正和返工。

本文基于 mingsi-skills 框架，系统性地介绍 System Prompt 设计的七模块方法论和持续优化体系。

## 七模块设计法

一个完整的 System Prompt 应包含以下七个模块：

### Module 1：角色定义

角色越具体，行为一致性越高：

```python
ROLE_TEMPLATE = """
你是 [角色名称]，[年限]经验的[领域]专家。

## 专业领域
- [领域一]：[具体能力描述]
- [领域二]：[具体能力描述]

## 工作风格
- [风格一]
- [风格二]

## 经验背景
- [背景一]
- [背景二]
"""
```

**对比效果：**
- ❌ 模糊：`你是一个 Python 开发者`
- ✅ 具体：`你是 10 年经验的 Python 后端工程师，精通 FastAPI 和 SQLAlchemy，擅长高并发系统设计`

### Module 2：目标声明

明确 Agent 的核心目标和优先级：

```python
OBJECTIVE_TEMPLATE = """
## 核心目标
[用一句话概括主要目标]

## 优先级
1. [最高优先级]
2. [次优先级]
3. [最低优先级]

## 衡量标准
- 目标一：[如何衡量]
- 目标二：[如何衡量]
"""
```

### Module 3：行为规范

明确的 Must Do / Must Not Do 清单：

```python
BEHAVIOR_TEMPLATE = """
## 行为准则

### ✅ 必须遵守
- [规则一]
- [规则二]

### ❌ 禁止行为
- [禁止一]
- [禁止二]

### 💡 推荐做法
- [建议一]
- [建议二]
"""
```

关键原则：禁止行为比推荐行为更重要。Agent 对负面约束的遵守率远高于正面建议。

### Module 4：输出格式

标准化输出结构，方便解析和验证：

```python
OUTPUT_TEMPLATE = """
## 输出规范

### 格式要求
[具体的格式模板]

### 质量标准
- 完整性：必须包含 [哪些部分]
- 准确性：必须基于 [什么依据]
- 可操作性：必须包含 [具体行动项]
"""
```

### Module 5：思考框架

引导 Agent 的推理过程：

```python
THINKING_TEMPLATE = """
## 思考过程

在给出最终答案前，请按以下步骤思考：

1️⃣ 理解：用自己的话重新描述问题
2️⃣ 分析：拆解问题的关键维度
3️⃣ 推理：基于已有知识进行逻辑推理
4️⃣ 验证：检查推理的合理性
5️⃣ 输出：给出结构化的最终答案
"""
```

### Module 6：知识边界

明确 Agent 的能力范围，减少幻觉：

```python
BOUNDARY_TEMPLATE = """
## 知识边界

### 我知道的
- 技术范围：[具体领域]
- 数据截止：[时间]

### 我不知道的
- [超出范围的内容]

### 不确定时怎么办
- [应对策略：如"请用户提供更多信息"]
"""
```

### Module 7：自检机制

让 Agent 在输出后自我评估：

```python
FEEDBACK_TEMPLATE = """
## 输出自检

每次回答后，请自我评估：
1. 回答质量（1-10）：___ 分
2. 是否遗漏关键信息：【是/否】
3. 如果有遗漏，补充：___
4. 是否有更好的回答方式：___
"""
```

## Token 预算分配

不同模块的 Token 分配建议：

| 模块 | 建议占比 | 4K 上下文 | 8K 上下文 |
|------|---------|----------|----------|
| 角色定义 | 10% | 400 | 800 |
| 目标声明 | 10% | 400 | 800 |
| 行为规范 | 25% | 1000 | 2000 |
| 输出格式 | 20% | 800 | 1600 |
| 思考框架 | 20% | 800 | 1600 |
| 知识边界 | 10% | 400 | 800 |
| 自检机制 | 5% | 200 | 400 |

## 实战案例：代码审查 Agent

### ❌ 优化前

```
你是一个代码审查助手，请审查以下代码。
```

问题：角色模糊，无行为规范，无输出格式，结果不可控。

### ✅ 优化后

```
你是 Senior Code Reviewer，10 年经验的资深工程师。

专业领域：
- 安全性：OWASP Top 10 漏洞检测
- 性能：O(n) 复杂度分析
- 可维护性：SOLID 原则

审查流程：
1. 理解代码意图
2. 分析实现方式
3. 评估潜在问题
4. 给出改进建议

输出格式：
## 审查总结（1-10分）
## 严重问题（必须修复）
## 建议改进（推荐优化）

行为规范：
- 必须基于代码本身，不臆测上下文
- 禁止提出无法量化的改进建议
```

**效果对比：**
| 指标 | 优化前 | 优化后 | 提升 |
|------|-------|-------|------|
| 问题检出率 | 45% | 85% | +40% |
| 可操作建议 | 30% | 90% | +60% |
| 输出一致性 | 低 | 高 | 显著 |

## A/B 测试框架

```python
class PromptABTest:
    """Prompt A/B 测试框架"""

    def __init__(self, version_a: str, version_b: str):
        self.versions = {'A': version_a, 'B': version_b}
        self.results = []

    def run_test(self, test_cases: list, evaluator_fn) -> dict:
        """运行 A/B 测试"""
        for case in test_cases:
            result_a = self._run_with_prompt(case, 'A')
            result_b = self._run_with_prompt(case, 'B')
            score_a = evaluator_fn(result_a)
            score_b = evaluator_fn(result_b)
            self.results.append({
                'case': case,
                'score_a': score_a,
                'score_b': score_b,
            })

        avg_a = sum(r['score_a'] for r in self.results) / len(self.results)
        avg_b = sum(r['score_b'] for r in self.results) / len(self.results)
        return {'version_a_avg': avg_a, 'version_b_avg': avg_b, 'winner': 'A' if avg_a > avg_b else 'B'}
```

## 版本管理

```python
PROMPT_VERSION = {
    "version": "2.3.1",
    "date": "2026-06-01",
    "modules": ["role", "objective", "behavior", "output", "thinking"],
    "total_tokens": 2800,
    "changelog": [
        "v2.3.1: 优化思考框架，减少幻觉",
        "v2.3.0: 增加输出自检机制",
        "v2.2.0: 重构行为规范，减少歧义",
        "v2.1.0: 增加知识边界声明",
    ]
}
```

## 常见陷阱

| 陷阱 | 问题 | 解决方案 |
|------|------|---------|
| 过度详细 | Token 消耗大，核心指令被淹没 | 模块化设计，按需加载 |
| 缺乏约束 | Agent 行为不可控 | 明确的禁止清单 |
| 格式模糊 | 输出不统一 | 提供完整模板 |
| 角色混乱 | 行为不一致 | 单一角色定义 |
| 缺少边界 | 编造信息 | 清晰的知识边界 |

完整代码：[github.com/qingjian0/mingsi-skills](https://github.com/qingjian0/mingsi-skills)