import { jest } from '@jest/globals';
// expose jest globally for libraries expecting global jest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).jest = jest;
