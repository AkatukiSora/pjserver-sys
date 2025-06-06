import { Container } from 'typedi';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import logger from './logger.js';
import runMode from './functions/runMode.js';
import welcomeimage from './functions/welcomeimage.js';

Container.set('createCanvas', createCanvas);
Container.set('loadImage', loadImage);
Container.set('fetch', fetch);
Container.set('readFile', fs.readFile);
Container.set('logger', logger);
Container.set('runMode', runMode);
Container.set('welcomeimage', welcomeimage);
Container.set('GlobalFonts', GlobalFonts);

export default Container;
