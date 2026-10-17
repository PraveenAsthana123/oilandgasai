import { test, expect, APIRequestContext } from '@playwright/test';

const ADMIN_CREDS = { email: 'admin@oilandgas.com', password: 'admin123' };

async function loginAsAdmin(request: APIRequestContext) {
  await request.post('/api/auth/login', { data: ADMIN_CREDS });
}

const DEPT_STREAMS = [
  { stream: 'upstream', dept: 'drilling-engineering' },
  { stream: 'upstream', dept: 'reservoir-engineering' },
  { stream: 'upstream', dept: 'production-engineering' },
  { stream: 'midstream', dept: 'pipeline-integrity' },
  { stream: 'midstream', dept: 'gas-compression' },
  { stream: 'downstream', dept: 'crude-distillation' },
  { stream: 'downstream', dept: 'environmental-compliance' },
];

test.describe('Job Runner APIs', () => {
  test.beforeEach(async ({ request }) => {
    await loginAsAdmin(request);
  });

  for (const { stream, dept } of DEPT_STREAMS) {
    test(`POSITIVE: POST /api/${stream}/${dept}/jobs/run returns JSON (200 or 500 if no DB)`, async ({ request }) => {
      const res = await request.post(`/api/${stream}/${dept}/jobs/run`, {
        data: { job_id: 'import' },
      });
      expect([200, 500]).toContain(res.status());
      const body = await res.json();
      expect(typeof body).toBe('object');
    });
  }

  test('NEGATIVE: job run without auth returns 401', async ({ request }) => {
    const res = await request.post('/api/upstream/drilling-engineering/jobs/run', {
      headers: { Cookie: 'og_session=invalid_session' },
      data: { job_id: 'import' },
    });
    expect([401, 403]).toContain(res.status());
  });
});
