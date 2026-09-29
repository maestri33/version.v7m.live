import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateNextVersion, compareVersions } from '../src/lib/semver.ts';

describe('Version Oracle SemVer Calculations', () => {
  it('increments standard SemVer patch versions', () => {
    assert.equal(calculateNextVersion('1.0.0', 'patch'), '1.0.1');
    assert.equal(calculateNextVersion('1.2.3', 'patch'), '1.2.4');
  });

  it('increments standard SemVer minor versions', () => {
    assert.equal(calculateNextVersion('1.2.3', 'minor'), '1.3.0');
  });

  it('increments standard SemVer major versions', () => {
    assert.equal(calculateNextVersion('1.2.3', 'major'), '2.0.0');
  });

  it('increments sandbox prerelease versions in lockstep', () => {
    assert.equal(calculateNextVersion('0.0.0-sandbox.40', 'patch'), '0.0.0-sandbox.41');
    assert.equal(calculateNextVersion('0.0.0-sandbox.99', 'patch'), '0.0.0-sandbox.100');
  });

  it('correctly compares version precedence', () => {
    assert.ok(compareVersions('0.0.0-sandbox.41', '0.0.0-sandbox.40') > 0);
    assert.ok(compareVersions('1.0.0', '0.0.0-sandbox.40') > 0);
    assert.ok(compareVersions('0.0.0-sandbox.40', '0.0.0-sandbox.41') < 0);
    assert.equal(compareVersions('1.0.0', '1.0.0'), 0);
  });

  it('rejects POST /api/version without Authorization header with 401', async () => {
    const { POST } = await import('../src/pages/api/version/index.ts');
    const req = new Request('https://version.v7m.live/api/version', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: 'version.v7m.live', type: 'patch' }),
    });
    const res = await POST({ request: req });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, 'Unauthorized');
  });
});
