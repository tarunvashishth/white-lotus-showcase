import serverless from 'serverless-http';
import { createApp } from '../../server/src/app.js';

// /api/* is rewritten to /.netlify/functions/api/api/* (see netlify.toml); strip the function prefix.
export const handler = serverless(createApp(), { basePath: '/.netlify/functions/api' });
