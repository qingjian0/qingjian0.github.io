---
title: "构建跨工具共享记忆系统：MCP 协议与 FTS5 + 向量混合检索架构深度解析"
date: 2026-06-01
tags: [MCP, Agent Memory, FTS5, RAG, SQLite, shared-memory-skill]
---

# 构建跨工具共享记忆系统

## 引言

当前 AI 编码助手（Codex、Claude Code、Cursor、Cline 等）各自维护独立的会话上下文，导致开发者在不同工具间切换时，工具无法感知彼此的历史交互和用户偏好。就像每天换一个助手，每个新助手都不记得你之前的习惯和项目背景。

共享记忆系统的核心目标：让不同 AI Agent 工具共享一个持久化、可检索的记忆层，实现跨工具的上下文连贯性。

## 技术选型对比

| 方案 | FTS5 纯文本 | 纯向量检索 | 混合方案（本系统） |
|------|-----------|-----------|----------------|
| 精确关键词匹配 | ★★★★★ | ★★ | ★★★★★ |
| 代码符号搜索 | ★★★★★ | ★★ | ★★★★★ |
| 语义模糊匹配 | ★ | ★★★★★ | ★★★★★ |
| 部署复杂度 | 零依赖 | 需模型 | 低 |
| 离线可用性 | 完全离线 | 依赖模型 | 完全离线 |

## 数据库 Schema

```sql
CREATE TABLE IF NOT EXISTS memories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id    TEXT NOT NULL,
    session_id  TEXT,
    content     TEXT NOT NULL,
    content_type TEXT DEFAULT 'text',
    importance  INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT (datetime('now')),
    metadata    TEXT DEFAULT '{}'
);

CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts
USING fts5(content, content_type, tokenize='unicode61');

CREATE TABLE IF NOT EXISTS memory_vectors (
    id          INTEGER PRIMARY KEY,
    vector      BLOB NOT NULL,
    model_name  TEXT DEFAULT 'all-MiniLM-L6-v2',
    dimensions  INTEGER DEFAULT 384
);
```

## 混合检索算法实现

混合检索是本系统的核心创新，结合了 FTS5 的精确匹配能力和向量检索的语义理解能力：

```python
import numpy as np
from typing import List, Dict

class HybridRetriever:
    """FTS5 + 向量混合检索器"""

    def __init__(self, alpha: float = 0.6, top_k: int = 10):
        self.alpha = alpha  # FTS5 权重，越高越侧重精确匹配
        self.top_k = top_k

    def hybrid_search(self, query: str, conn) -> List[Dict]:
        """执行混合检索"""
        fts5_scores = self._fts5_search(query, conn)
        vec_scores = self._vector_search(self._embed(query), conn)
        fused = self._fuse(fts5_scores, vec_scores)
        return sorted(fused, key=lambda x: x['score'], reverse=True)[:self.top_k]

    def _fts5_search(self, query: str, conn) -> Dict[int, float]:
        cursor = conn.execute("""
            SELECT m.id, rank FROM memories_fts
            JOIN memories m ON m.id = memories_fts.rowid
            WHERE memories_fts MATCH ? ORDER BY rank LIMIT ?
        """, (query, self.top_k * 2))
        return {row[0]: float(row[1]) for row in cursor.fetchall()}

    def _vector_search(self, vec: np.ndarray, conn) -> Dict[int, float]:
        """余弦相似度搜索"""
        cursor = conn.execute("SELECT id, vector FROM memory_vectors")
        results = {}
        for row in cursor.fetchall():
            stored = np.frombuffer(row[1], dtype=np.float32)
            sim = float(np.dot(vec, stored) / (
                np.linalg.norm(vec) * np.linalg.norm(stored) + 1e-8))
            results[row[0]] = sim
        return results

    def _fuse(self, fts5: Dict, vec: Dict) -> List[Dict]:
        """加权融合排序"""
        all_ids = set(list(fts5.keys()) + list(vec.keys()))
        max_f = max(fts5.values()) if fts5 else 1
        max_v = max(vec.values()) if vec else 1
        results = []
        for mid in all_ids:
            score = self.alpha * fts5.get(mid, 0) / max_f
            score += (1 - self.alpha) * vec.get(mid, 0) / max_v
            results.append({'id': mid, 'score': score})
        return results
```

## MCP 服务器实现

MCP (Model Context Protocol) 是 Anthropic 提出的标准化协议，允许 Agent 工具通过统一接口访问外部资源：

```python
#!/usr/bin/env python3
"""MCP 记忆服务器 - 跨工具共享记忆"""

import json, sqlite3
from sentence_transformers import SentenceTransformer
import numpy as np

class MemoryServer:
    """共享记忆服务器"""

    def __init__(self, db_path: str = "memory.db"):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.retriever = HybridRetriever(alpha=0.6)
        self._init_db()

    def store(self, agent_id: str, content: str, **kwargs) -> int:
        """存储一条记忆"""
        cursor = self.conn.execute(
            'INSERT INTO memories (agent_id, content, content_type, importance) VALUES (?,?,?,?)',
            (agent_id, content, kwargs.get('type', 'text'), kwargs.get('importance', 1))
        )
        mem_id = cursor.lastrowid
        # 写入 FTS5 索引
        self.conn.execute(
            'INSERT INTO memories_fts (rowid, content, content_type) VALUES (?,?,?)',
            (mem_id, content, kwargs.get('type', 'text'))
        )
        # 生成并存储向量
        vector = self.model.encode(content).astype(np.float32)
        self.conn.execute(
            'INSERT INTO memory_vectors (id, vector) VALUES (?,?)',
            (mem_id, vector.tobytes())
        )
        self.conn.commit()
        return mem_id

    def search(self, query: str, top_k: int = 10) -> list:
        """检索记忆"""
        return self.retriever.hybrid_search(query, self.conn)
```

## 实战场景

### 场景一：跨工具项目延续

在 Codex 中完成 FastAPI 项目架构设计后，切换到 Cursor：

```json
{
  "agent_id": "codex",
  "content": "项目 user-service: FastAPI + SQLAlchemy 2.0 + Pydantic v2",
  "content_type": "project_context",
  "importance": 5
}
```

### 场景二：错误修复记忆库

```json
{
  "agent_id": "claude",
  "content": "SQLAlchemy 错误: Object is already attached. 修复: 使用 session.merge()",
  "content_type": "error_solution",
  "importance": 4
}
```

## 性能优化

### 向量量化压缩

将 float32 向量压缩为 int8，体积缩小 4 倍：

```python
def quantize(vec: np.ndarray) -> tuple:
    scale = float(np.max(np.abs(vec))) or 1.0
    return (vec / scale * 127).astype(np.int8), scale
```

### 时间衰减权重

赋予近期记忆更高优先级：

```python
def time_decay(created_at: str, half_life: int = 30) -> float:
    days = (datetime.now() - datetime.fromisoformat(created_at)).days
    return math.pow(0.5, days / half_life)
```

## 部署方式

```bash
pip install sentence-transformers numpy
python memory_server.py --port 9090 --db ~/.shared-memory/memory.db
```

## 总结

| 特性 | 状态 | 说明 |
|------|------|------|
| 跨工具共享 | ✅ | 基于 MCP 协议，支持 Codex/Claude/Cursor/Cline |
| 混合检索 | ✅ | FTS5 精确 + 向量语义，兼顾速度与精度 |
| 零外部依赖 | ✅ | 仅需 SQLite + 轻量模型，无需部署 ES |
| 隐私安全 | ✅ | 完全本地运行，数据不上云 |
| 离线可用 | ✅ | 无需网络连接 |

完整代码: [github.com/qingjian0/shared-memory-skill](https://github.com/qingjian0/shared-memory-skill)