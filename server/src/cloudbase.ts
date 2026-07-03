import serverless from 'serverless-http';
import { app } from './index';

// CloudBase 云函数入口
export const main = serverless(app);
