const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const events = require('events') as typeof import('events');
const crypto = require('crypto') as typeof import('crypto');
const playwright = require('playwright-core') as typeof import('playwright-core');
const child_process = require('child_process') as typeof import('child_process');
const os = require('os') as typeof import('os');

export const NodeJS = { fs, path, events, crypto, playwright, child_process, os };
