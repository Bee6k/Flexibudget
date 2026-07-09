const { toMonthly } = require('../utils/finance');

describe('toMonthly', () => {
  it('converts weekly amounts to monthly', () => {
    expect(toMonthly(100, 'weekly')).toBeCloseTo((100 * 52) / 12, 5);
  });

  it('converts yearly amounts to monthly', () => {
    expect(toMonthly(1200, 'yearly')).toBe(100);
  });

  it('excludes one-time expenses from recurring monthly burn', () => {
    expect(toMonthly(5000, 'one-time')).toBe(0);
  });

  it('returns monthly amounts unchanged', () => {
    expect(toMonthly(1500, 'monthly')).toBe(1500);
  });
});
