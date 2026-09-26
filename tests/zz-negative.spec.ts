import { test, expect } from '@playwright/test';

test('deliberately fails to prove the ci check blocks merges', () => {
  expect(1).toBe(2);
});
