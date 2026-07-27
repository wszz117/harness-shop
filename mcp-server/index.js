#!/usr/bin/env node
/**
 * shop-v2 本地 MCP 工具服务（stdio JSON-RPC）
 * 提供三个只读工具：harness_board（看板）、harness_task_status（任务文档状态）、verify_quick（跑 verify.sh）
 */
import { createInterface } from 'node:readline';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TOOLS = [
  {
    name: 'harness_board',
    description: '读取 Harness 任务看板 (.harness/tasks/board.md)',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'harness_task_status',
    description: '查看指定任务的交付文档与结论状态',
    inputSchema: {
      type: 'object',
      properties: { task: { type: 'string', description: '任务 slug' } },
      required: ['task'],
    },
  },
  {
    name: 'verify_quick',
    description: '运行 .harness/scripts/verify.sh 硬门禁并返回结果',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
];

function conclusionOf(file) {
  if (!existsSync(file)) return 'MISSING';
  const txt = readFileSync(file, 'utf-8');
  const m = [...txt.matchAll(/^##\s*结论\b([\s\S]*?)(?=^##\s+|(?![\s\S]))/gm)].pop();
  if (!m) return 'NO_CONCLUSION';
  const first = m[1].split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('>')) || '';
  return first.slice(0, 60) || 'EMPTY';
}

function callTool(name, args) {
  if (name === 'harness_board') {
    const p = path.join(ROOT, '.harness/tasks/board.md');
    return existsSync(p) ? readFileSync(p, 'utf-8') : 'board.md 不存在';
  }
  if (name === 'harness_task_status') {
    const dir = path.join(ROOT, '.harness/deliverables', args.task);
    const archived = path.join(ROOT, '.harness/deliverables/_archive', args.task);
    const base = existsSync(dir) ? dir : existsSync(archived) ? archived : null;
    if (!base) return `任务不存在: ${args.task}`;
    const docs = readdirSync(base).filter((f) => f.endsWith('.md'));
    const lines = docs.map((d) => `${d}: ${conclusionOf(path.join(base, d))}`);
    return `任务 ${args.task}（${base.includes('_archive') ? '已归档' : '活跃'}）\n${lines.join('\n')}`;
  }
  if (name === 'verify_quick') {
    try {
      return execSync('bash .harness/scripts/verify.sh', { cwd: ROOT, encoding: 'utf-8', timeout: 300000 });
    } catch (e) {
      return `[verify FAIL rc=${e.status}]\n${(e.stdout || '') + (e.stderr || '')}`;
    }
  }
  throw new Error(`未知工具: ${name}`);
}

const rl = createInterface({ input: process.stdin });
rl.on('line', (line) => {
  let req;
  try {
    req = JSON.parse(line);
  } catch {
    return;
  }
  const reply = (result, error) => {
    const msg = { jsonrpc: '2.0', id: req.id };
    if (error) msg.error = { code: -32000, message: String(error) };
    else msg.result = result;
    process.stdout.write(JSON.stringify(msg) + '\n');
  };
  try {
    if (req.method === 'initialize') {
      reply({
        protocolVersion: '2024-11-05',
        serverInfo: { name: 'shop-v2-tools', version: '1.0.0' },
        capabilities: { tools: {} },
      });
    } else if (req.method === 'tools/list') {
      reply({ tools: TOOLS });
    } else if (req.method === 'tools/call') {
      const text = callTool(req.params.name, req.params.arguments || {});
      reply({ content: [{ type: 'text', text }] });
    } else if (req.method === 'notifications/initialized') {
      // no-op
    } else if (req.id !== undefined) {
      reply(null, `未知方法: ${req.method}`);
    }
  } catch (e) {
    reply(null, e.message);
  }
});
