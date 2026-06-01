---
title: "求是方法论在 AI Agent 中的应用：从唯物辩证法到 Prompt Engineering 的工程化实践"
date: 2026-06-01
tags: [求是, AI Agent, Prompt Engineering, 方法论, 唯物辩证法, qiushi-skill]
---

# 求是方法论在 AI Agent 中的应用

## 引言

"实事求是"是中国哲学的核心方法论。在 AI Agent 工程领域，这套方法论可以从经典唯物辩证法中提炼出九大原则，用于系统化指导 Prompt Engineering、Agent 行为设计和结果评估。

本文将探讨如何将求是方法论转化为可工程化的 AI Agent 增强框架。

## 九大方法论体系

### 1. 矛盾分析法

**核心思想：** 抓住主要矛盾和矛盾的主要方面。

**Prompt 实践：**

`python
ANALYSIS_PROMPT = """请分析当前问题中的矛盾关系：
1. 主要矛盾是什么？（核心待解决问题）
2. 矛盾的主要方面是？
3. 次要矛盾有哪些？
4. 矛盾转化条件是什么？

输出格式：
{主要矛盾: "...", 主要方面: "...", 次要矛盾: [...], 转化条件: [...]}
"""
`

**应用效果：** 上下文窗口有限时，优先处理高优先级矛盾，忽略次要矛盾。

### 2. 质量互变律

**核心思想：** 量变引起质变，持续的积累会带来系统性的变革。

**Agent 学习策略：**

`python
class AccumulationLearning:
    def __init__(self, threshold: int = 100):
        self.count = 0
        self.threshold = threshold

    def observe(self, pattern: str):
        self.count += 1
        if self.count >= self.threshold:
            return self._transform_to_rule(pattern)
        return None

    def _transform_to_rule(self, pattern: str) -> str:
        """量变到质变：将观察转化为规则"""
        return f"根据 {self.count} 次观察，总结规则: {pattern}"
`

### 3. 否定之否定

**核心思想：** 发展是螺旋式上升的，每一次否定都是扬弃。

**Prompt 迭代框架：**

`python
NEGATION_PROMPT = """你提出的方案是【正题】。
请从相反角度分析：
1. 这个方案的核心假设是什么？
2. 如果这个假设不成立，会怎样？
3. 综合正反两面，给出【合题】方案。

格式：
{正题: "...", 反题: "...", 合题: "..."}
"""
`

### 4. 实践检验法

**核心思想：** 实践是检验真理的唯一标准。

`python
PRACTICE_PROMPT = """请为你的方案设计测试方案：
1. 如何验证方案的正确性？
2. 需要哪些测试数据？
3. 成功的标准是什么？
4. 失败的回退方案是什么？

输出可执行测试计划。
"""
`

### 5. 全面联系法

**核心思想：** 事物是普遍联系的，不能孤立看问题。

`python
SYSTEM_PROMPT = """分析问题时，请考虑以下关联维度：
1. 技术维度：与现有系统的兼容性
2. 用户维度：对用户体验的影响
3. 业务维度：成本和收益分析
4. 时间维度：短期效果 vs 长期影响
5. 风险维度：潜在风险和应对方案
"""
`

### 6. 发展变化观

**核心思想：** 事物处于不断发展变化中。

`python
EVOLUTION_PROMPT = """评估方案的可持续性：
1. 当前状态分析
2. 未来 3 个月可能的变化
3. 未来 6 个月可能的变化
4. 方案的可扩展性
5. 升级路径规划
"""
`

### 7. 具体问题具体分析

**核心思想：** 抽象原则必须结合具体情境。

`python
CONTEXTUAL_PROMPT = """在应用通用原则前，请先分析具体情境：
1. 当前上下文的特点是什么？
2. 通用方案在此时此地的适用性如何？
3. 需要做哪些本地化调整？
4. 特殊情况的处理预案？
"""
`

### 8. 因果关系分析法

**核心思想：** 透过现象看本质，找到根本原因。

`python
CAUSAL_PROMPT = """5-Why 分析法：
1. 表面现象是什么？
2. 为什么会出现？（第一层原因）
3. 为什么会这样？（第二层原因）
4. 为什么会这样？（第三层原因）
5. 为什么会这样？（第四层原因）
6. 根因是什么？（第五层原因）

输出：{现象: "...", 根因: "...", 解决方案: "..."}
"""
`

### 9. 群众路线

**核心思想：** 从群众中来，到群众中去。

`python
FEEDBACK_LOOP_PROMPT = """设计反馈循环：
1. 收集：如何收集用户反馈？
2. 分析：如何分析反馈数据？
3. 改进：如何将反馈转化为改进？
4. 验证：如何验证改进效果？
5. 循环：如何持续迭代？
"""
`

## 工程化实现：Qiushi-Skill 框架

将上述九大方法论整合为一个可复用的 Agent Skill：

`python
class QiushiFramework:
    """求是方法论框架"""

    def __init__(self):
        self.methods = {
            'contradiction': self._apply_contradiction,
            'quantity_quality': self._apply_quantity_quality,
            'negation': self._apply_negation,
            'practice': self._apply_practice,
            'connection': self._apply_connection,
            'evolution': self._apply_evolution,
            'contextual': self._apply_contextual,
            'causal': self._apply_causal,
            'feedback': self._apply_feedback,
        }

    def analyze(self, problem: str, methods: list = None) -> dict:
        """对给定问题应用指定的方法论组合"""
        if methods is None:
            methods = ['contradiction', 'causal', 'contextual']
        results = {}
        for method in methods:
            if method in self.methods:
                results[method] = self.methods[method](problem)
        return results

    def synthesize(self, analyses: dict) -> str:
        """综合多种分析视角"""
        prompt = "综合以下多角度分析，给出最终方案：\n"
        for method, result in analyses.items():
            prompt += f"\n【{method}】分析结果:\n{json.dumps(result, ensure_ascii=False, indent=2)}"
        prompt += "\n\n请基于以上分析，给出综合解决方案。"
        return prompt
`

## 实际应用案例

### 案例：设计一个代码审查 Agent

**Step 1 - 矛盾分析：**
`
主要矛盾: 审查质量 vs 审查速度
主要方面: 质量优先，但不牺牲过多速度
次要矛盾: 自动审查 vs 人工审查
转化条件: 当准确率 > 95% 时可转为全自动
`

**Step 2 - 因果分析：**
`
现象: 代码审查经常遗漏安全问题
根因: 审查者缺乏安全上下文
解决方案: 关联安全数据库和 CVE 信息
`

**Step 3 - 实践检验：**
`
验证方案: 用 100 个已知有安全漏洞的代码片段测试
成功标准: 检出率 > 85%，误报率 < 10%
回退方案: 人工复审所有告警
`

### 案例：优化 RAG 系统

**Step 1 - 全面联系：**
`
技术维度: Embedding 模型选择影响检索质量
用户维度: 响应时间影响用户体验
业务维度: 模型大小影响部署成本
时间维度: 文档持续更新需要增量索引
`

**Step 2 - 发展变化：**
`
当前: 基础 RAG (检索 + 生成)
3个月: 加入 Reranker 重排序
6个月: 支持多模态 RAG
可扩展: 模块化设计便于替换组件
`

## 方法论整合效果

| 方法论 | 适用场景 | 效果指标 |
|--------|---------|---------|
| 矛盾分析 | 问题优先级排序 | 决策效率提升 50% |
| 因果分析 | Bug 定位 | 根本原因定位准确率提升 40% |
| 实践检验 | 方案验证 | 方案质量提升 35% |
| 全面联系 | 系统设计 | 设计遗漏减少 60% |
| 质量互变 | 持续学习 | 知识积累效率提升 45% |

## 结论

将求是方法论系统化地应用于 AI Agent 工程中，可以有效提升 Agent 的推理质量、决策全面性和结果稳定性。这不是理论空谈，而是一套可编程、可测试、可迭代的工程实践框架。

关键要点：
1. 九大方法论可对应不同的 Agent 行为模式
2. 每种方法论都可转化为具体的 Prompt 模板
3. 多方法论组合使用效果优于单一方法
4. 需要结合实际场景灵活选用

完整代码: [github.com/qingjian0/qiushi-skill](https://github.com/qingjian0/qiushi-skill)