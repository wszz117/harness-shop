// E2E 证据截图：按 test-e2e SKILL 命名规范落盘
// 目录优先级：E2E_EVIDENCE_DIR > .playwright-cli_tasks/<E2E_EVIDENCE_TASK|adhoc>/
// 归档时由 harness-archive 把截图移入 deliverables/_archive/<task>/evidence/
import fs from 'node:fs';
import path from 'node:path';

export const evidenceDir = () =>
  path.resolve(
    process.env.E2E_EVIDENCE_DIR ||
      path.join('.playwright-cli_tasks', process.env.E2E_EVIDENCE_TASK || 'adhoc')
  );

// 截当前视口（含顶栏、横幅与首屏内容），不截全页，保证断言点清晰可见
export async function saveEvidence(page, name) {
  const dir = evidenceDir();
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file, animations: 'disabled' });
  return file;
}
