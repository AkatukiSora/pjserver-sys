import runMode from '../runMode.js';

describe('runMode', () => {
  const env = process.env.mode;

  afterEach(() => {
    process.env.mode = env;
  });

  it('returns correct mode strings', () => {
    process.env.mode = '1';
    expect(runMode()).toBe('メイン環境');
    process.env.mode = '2';
    expect(runMode()).toBe('スタンバイ環境');
    process.env.mode = '0';
    expect(runMode()).toBe('開発環境');
    process.env.mode = 'unknown';
    expect(runMode()).toBe('不明');
  });
});
