/**
 * Example Test Suite
 * This is a template for writing tests in the backend
 */

describe('Example Test Suite', () => {
  test('should pass basic assertion', () => {
    expect(true).toBe(true);
  });

  test('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle async operations', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });
});
