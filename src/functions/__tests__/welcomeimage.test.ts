/* eslint-disable import/no-unresolved */
import { jest } from '@jest/globals';
import { Container } from 'typedi';
import '../../container.js';

const createCanvasMock = jest.fn(() => ({
  getContext: () => ({
    drawImage: jest.fn(),
    strokeRect: jest.fn(),
    fillStyle: '',
    font: '',
    fillText: jest.fn(),
    measureText: () => ({ width: 0 }),
    save: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    clip: jest.fn(),
    drawImage: jest.fn(),
    restore: jest.fn(),
  }),
  toBuffer: () => Buffer.from('img'),
}));

const loadImageMock = jest.fn(() => ({}));
const registerMock = jest.fn();
const fetchMock = jest.fn(async () => ({ ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(0) }));
const readFileMock = jest.fn(async () => Buffer.from('bg'));

const { default: welcomeimage } = await import('../welcomeimage.js');

describe('welcomeimage', () => {
  it('generates image buffer', async () => {
    Container.reset();
    Container.set('createCanvas', createCanvasMock);
    Container.set('loadImage', loadImageMock);
    Container.set('fetch', fetchMock);
    Container.set('readFile', readFileMock);
    Container.set('GlobalFonts', { registerFromPath: registerMock });
    const buf = await welcomeimage('user', 'http://avatar');
    expect(buf).toBeInstanceOf(Buffer);
    expect(createCanvasMock).toHaveBeenCalled();
    expect(loadImageMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalled();
    expect(readFileMock).toHaveBeenCalled();
  });
});
