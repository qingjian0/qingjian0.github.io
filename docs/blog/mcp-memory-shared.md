---
title: "构建跨工具共享记忆系统：MCP 协议与 FTS5 + 向量混合检索架构深度解析"
date: 2026-06-01
tags: [MCP, Agent Memory, FTS5, RAG, SQLite, shared-memory-skill]
---

# 构建跨工具共享记忆系统

## 引言

当前 AI 编码助手（Codex、Claude Code、Cursor、Cline 等）各自维护独立的会话上下文，导致开发者在不同工具间切换时，工具无法感知彼此的历史交互和用户偏好。就像每天换一个助手——每个新助手都不记得你之前的习惯和项目背景。

共享记忆系统的核心目标，是让不同 AI Agent 工具共享一个持久化、可检索的记忆层，实现跨工具的上下文连贯性。

## 问题分析

### 当前痛点

1. **上下文断裂**：在 Codex 中完成了项目架构设计，切换到 Cursor 后需要重新说明所有上下文
2. **知识孤岛**：每个工具的调试经验、错误修复方案无法共享给其他工具
3. **重复劳动**：相同的配置说明、偏好设置需要在每个工具中重复配置
4. **学习断层**：工具无法从历史交互中学习用户偏好和行为模式

### 解决思路

构建一个基于 MCP 协议的共享记忆服务，所有 Agent 工具通过标准化接口读写记忆，实现知识的跨工具流动。

## 系统架构

### 三层架构设计

```
+-----------------------+
|     Agent Tools       |
| Codex / Claude /      |
| Cursor / Cline        |
+----------+------------+
           |
    MCP 协议层（标准化通信）
           |
+----------+------------+
|   Memory Server       |
|  核心引擎              |
+----------+------------+
           |
+----------+------------+
|   存储层               |
| SQLite + FTS5 + Vector|
+-----------------------+
```

### 设计理念

- **插件化**：Agent 工具通过 MCP 协议即插即用
- **本地优先**：数据存储在本地，保证隐私和安全
- **混合检索**：结合精确匹配和语义理解的优势
- **最小依赖**：仅依赖 SQLite 和轻量级 Embedding 模型

## 技术选型

### 为什么选择 SQLite + FTS5？

| 对比维度 | Elasticsearch | Redis + Vector | SQLite FTS5（本系统） |
|---------|--------------|---------------|---------------------|
| 部署复杂度 | 高（需独立部署） | 中 | 零（嵌入式） |
| 资源占用 | 数 GB 内存 | 数百 MB | 数 MB |
| 全文检索 | 优秀 | 不支持 | 优秀（FTS5） |
| 语义检索 | 需插件 | Redis Stack | 需搭配模型 |
| 数据迁移 | 复杂 | 简单 | 单文件拷贝 |
| 离线可用 | 否 | 否 | 完全支持 |

### Embedding 模型选型

| 模型 | 维度 | 大小 | 性能 | 适用场景 |
|-----|------|-----|------|---------|
| all-MiniLM-L6-v2 | 384 | 80MB | 优秀 | 通用语义搜索 |
| all-mpnet-base-v2 | 768 | 420MB | 最佳 | 高精度场景 |
| intfloat/e5-small-v2 | 384 | 120MB | 良好 | 中文优化 |

## 数据库 Schema 设计

### 核心记忆表

```sql
-- 记忆主表：存储所有记忆的核心数据
CREATE TABLE IF NOT EXISTS memories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id    TEXT NOT NULL,        -- 来源: codex/claude/cursor/cline
    session_id  TEXT,                 -- 会话 ID（可选）
    content     TEXT NOT NULL,        -- 记忆内容
    content_type TEXT DEFAULT 'text', -- 类型: text/code/error/config/preference
    importance  INTEGER DEFAULT 1,   -- 1-5 重要度
    created_at  DATETIME DEFAULT (datetime('now')),
    updated_at  DATETIME DEFAULT (datetime('now')),
    metadata    TEXT DEFAULT '{}'     -- JSON 扩展字段
);
```

### 全文索引

```sql
-- FTS5 全文索引（支持 unicode61 中文分词）
CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts
USING fts5(content, content_type, tokenize='unicode61');
```

### 向量存储

```sql
-- 语义检索向量存储
CREATE TABLE IF NOT EXISTS memory_vectors (
    id          INTEGER PRIMARY KEY,
    vector      BLOB NOT NULL,           -- float32 序列化
    model_name  TEXT DEFAULT 'all-MiniLM-L6-v2'
);

-- 标签索引
CREATE TABLE IF NOT EXISTS memory_tags (
    memory_id   INTEGER NOT NULL,
    tag         TEXT NOT NULL,
    PRIMARY KEY (memory_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_tag ON memory_tags(tag);
```

## 混合检索算法实现

### 核心算法

混合检索是本系统最核心的部分。它结合了 FTS5 的精确关键词匹配和向量检索的语义理解，通过加权融合的方式综合排序。

```python
import numpy as np
from typing import List, Dict, Tuple

class HybridRetriever:
    """
    FTS5 + 向量混合检索器

    融合策略：Reciprocal Rank Fusion 变体
    alpha 参数控制 FTS5 和向量检索的权重比例
    """

    def __init__(self, alpha: float = 0.6, top_k: int = 10):
        self.alpha = alpha
        self.top_k = top_k

    def hybrid_search(self, query: str, conn) -> List[Dict]:
        """执行混合检索"""
        # 并行执行两种检索
        fts5_scores = self._fts5_search(query, conn)
        vec_scores = self._vector_search(self._embed(query), conn)

        # 加权融合
        fused = self._fuse_scores(fts5_scores, vec_scores)
        return fused[:self.top_k]

    def _fts5_search(self, query: str, conn) -> Dict[int, float]:
        """FTS5 全文检索"""
        cursor = conn.execute("""
            SELECT m.id, rank
            FROM memories_fts
            JOIN memories m ON m.id = memories_fts.rowid
            WHERE memories_fts MATCH ?
            ORDER BY rank
            LIMIT ?
        """, (query, self.top_k * 2))

        return {row[0]: float(row[1]) for row in cursor.fetchall()}

    def _vector_search(self, vec: np.ndarray, conn) -> Dict[int, float]:
        """向量余弦相似度检索"""
        cursor = conn.execute("SELECT id, vector FROM memory_vectors")
        results = {}

        for row in cursor.fetchall():
            stored = np.frombuffer(row[1], dtype=np.float32)
            # 余弦相似度
            sim = float(np.dot(vec, stored) / (
                np.linalg.norm(vec) * np.linalg.norm(stored) + 1e-8
            ))
            results[row[0]] = sim

        return results

    def _fuse_scores(self, fts5: Dict, vec: Dict) -> List[Dict]:
        """加权融合排序"""
        all_ids = set(list(fts5.keys()) + list(vec.keys()))

        # 归一化
        max_f = max(fts5.values()) if fts5 else 1
        max_v = max(vec.values()) if vec else 1

        results = []
        for mid in all_ids:
            score = self.alpha * fts5.get(mid, 0) / max_f
            score += (1 - self.alpha) * vec.get(mid, 0) / max_v
            results.append({'id': mid, 'score': round(score, 4)})

        return sorted(results, key=lambda x: x['score'], reverse=True)
```

### 参数调优建议

alpha 参数控制两种检索的权重，不同场景建议取值：

| 场景 | Alpha 值 | 说明 |
|------|---------|------|
| 代码搜索 | 0.8 | 精确匹配优先 |
| 错误查找 | 0.7 | 关键词为主，语义为辅 |
| 灵感探索 | 0.3 | 语义相似优先 |
| 默认混合 | 0.6 | 均衡模式 |

## MCP 服务器实现

### 服务器端

MCP（Model Context Protocol）是 Anthropic 提出的标准化 Agent 通信协议。下面的实现是一个完整的 MCP 记忆服务器：

```python
import json
import sqlite3
from http.server import HTTPServer, BaseHTTPRequestHandler
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
            """INSERT INTO memories
               (agent_id, content, content_type, importance)
               VALUES (?, ?, ?, ?)""",
            (agent_id, content,
             kwargs.get('type', 'text'),
             kwargs.get('importance', 1))
        )
        mem_id = cursor.lastrowid

        # 更新 FTS5 索引
        self.conn.execute(
            "INSERT INTO memories_fts (rowid, content, content_type) VALUES (?, ?, ?)",
            (mem_id, content, kwargs.get('type', 'text'))
        )

        # 生成并存储向量
        vector = self.model.encode(content).astype(np.float32)
        self.conn.execute(
            "INSERT INTO memory_vectors (id, vector) VALUES (?, ?)",
            (mem_id, vector.tobytes())
        )

        self.conn.commit()
        return mem_id

    def search(self, query: str, top_k: int = 10) -> list:
        """检索记忆"""
        return self.retriever.hybrid_search(query, self.conn)

    def delete(self, mem_id: int) -> bool:
        """删除记忆"""
        self.conn.execute("DELETE FROM memories WHERE id = ?", (mem_id,))
        self.conn.commit()
        return True

    def stats(self) -> dict:
        """获取统计信息"""
        total = self.conn.execute("SELECT COUNT(*) FROM memories").fetchone()[0]
        by_agent = self.conn.execute(
            "SELECT agent_id, COUNT(*) FROM memories GROUP BY agent_id"
        ).fetchall()
        return {
            "total_memories": total,
            "by_agent": dict(by_agent)
        }
```

### MCP 协议处理

```python
class MCPHandler(BaseHTTPRequestHandler):
    """MCP 协议 HTTP 处理器"""

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))

        method = body.get('method', '')
        params = body.get('params', {})

        handlers = {
            'memory/store': lambda p: self.server.memory.store(
                p['agent_id'], p['content'],
                type=p.get('type'),
                importance=p.get('importance')
            ),
            'memory/search': lambda p: self.server.memory.search(
                p['query'], p.get('top_k', 10)
            ),
            'memory/stats': lambda p: self.server.memory.stats(),
        }

        handler = handlers.get(method)
        result = handler(params) if handler else {'error': 'unknown method'}

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
```

## 实战场景详解

### 场景一：跨工具项目上下文延续

假设你在 Codex 中构建了一个 FastAPI 项目：

```json
{
  "agent_id": "codex",
  "content": "项目 user-service：FastAPI + SQLAlchemy 2.0 + Pydantic v2\n数据库：PostgreSQL 15，使用 asyncpg\n测试：pytest + httpx AsyncClient\nAPI 版本：v1",
  "content_type": "project_context",
  "importance": 5,
  "tags": ["project", "fastapi", "sqlalchemy"]
}
```

当切换到 Cursor 继续开发时，Cursor 通过 MCP 接口可以自动召回这个上下文，无需你再次说明项目的技术栈和架构设计。

### 场景二：错误修复共享

在 Claude Code 中解决了一个复杂错误：

```json
{
  "agent_id": "claude",
  "content": "SQLAlchemy 'Object is already attached' 错误\n原因：Session 被多个线程共享\n修复：使用 session.merge() 替代 session.add()\n或：每个线程使用独立的 Session",
  "content_type": "error_solution",
  "importance": 4,
  "tags": ["error", "sqlalchemy", "session"]
}
```

下次在任何工具中出现类似错误时，系统会基于关键词匹配或语义相似度自动推送这条记忆。

## 性能优化策略

### 1. 向量量化

将 float32 向量量化为 int8，存储缩小 4 倍：

```python
def quantize_vector(vec: np.ndarray) -> Tuple[np.ndarray, float]:
    """float32 -> int8 量化"""
    scale = float(np.max(np.abs(vec)))
    if scale == 0:
        return vec.astype(np.int8), 1.0
    return (vec / scale * 127).astype(np.int8), scale
```

### 2. 时间衰减

近期记忆权重更高，旧记忆逐步衰减：

```python
import math
from datetime import datetime

def apply_decay(memories: list, conn) -> list:
    """应用时间衰减，half_life=30天"""
    for mem in memories:
        row = conn.execute(
            "SELECT created_at FROM memories WHERE id = ?",
            (mem['id'],)
        ).fetchone()
        if row:
            created = datetime.fromisoformat(row[0])
            days = (datetime.now() - created).days
            decay = math.pow(0.5, days / 30)
            mem['score'] *= decay

    return sorted(memories, key=lambda x: x['score'], reverse=True)
```

### 3. 自动去重

基于语义相似度去除冗余记忆，防止记忆膨胀：

```python
def deduplicate(conn, threshold: float = 0.95) -> int:
    """删除高度重复的记忆"""
    rows = conn.execute("SELECT id, vector FROM memory_vectors").fetchall()
    deleted = 0

    for i, (id1, vec1) in enumerate(rows):
        v1 = np.frombuffer(vec1, dtype=np.float32)
        for id2, vec2 in rows[i+1:]:
            v2 = np.frombuffer(vec2, dtype=np.float32)
            sim = float(np.dot(v1, v2) / (
                np.linalg.norm(v1) * np.linalg.norm(v2)
            ))
            if sim > threshold:
                conn.execute("DELETE FROM memories WHERE id = ?", (id2,))
                deleted += 1

    conn.commit()
    return deleted
```

## 部署与配置

### 快速启动

```bash
pip install sentence-transformers numpy
python memory_server.py --port 9090 --db ~/.shared-memory/memory.db
```

### Agent 工具配置

**Codex 配置**（.codex/mcp.json）：
```json
{
  "mcpServers": {
    "shared-memory": {
      "command": "python",
      "args": ["memory_server.py", "--port", "9090"]
    }
  }
}
```

**Claude Code 配置**（~/.claude/mcp.json）：
```json
{
  "mcpServers": {
    "shared-memory": {
      "command": "python",
      "args": ["memory_server.py", "--port", "9090"]
    }
  }
}
```

## 总结

共享记忆系统是 AI Agent 从一次性工具进化为长期协作伙伴的关键基础设施。

| 特性 | 实现方案 | 优势 |
|------|---------|------|
| 跨工具共享 | MCP 协议 | 标准化，即插即用 |
| 混合检索 | FTS5 + Vector | 兼顾精确与语义 |
| 零依赖 | SQLite 嵌入式 | 无需额外部署 |
| 隐私安全 | 本地数据存储 | 数据不上云 |
| 离线可用 | 完全本地推理 | 无需网络 |

完整代码： [github.com/qingjian0/shared-memory-skill](https://github.com/qingjian0/shared-memory-skill)