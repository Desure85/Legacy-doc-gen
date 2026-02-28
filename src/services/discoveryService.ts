import { post, get } from './api';

export type DiscoveryStatus = {
  isRunning: boolean;
  currentStep: number;
  logs: string[];
  findings: any[];
};

export const DiscoveryService = {
  start: async (): Promise<{ jobId: string }> => {
    // In a real scenario, this triggers the backend process
    return await post('/discovery/start');
  },

  getStatus: async (jobId: string): Promise<DiscoveryStatus> => {
    return await get(`/discovery/status/${jobId}`);
  },

  stop: async (jobId: string): Promise<void> => {
    return await post(`/discovery/stop/${jobId}`);
  },

  syncIndex: async (): Promise<{ jobId: string }> => {
    return await post('/index/sync');
  },

  getIndexStatus: async (jobId: string): Promise<{ isSyncing: boolean; progress: number }> => {
    return await get(`/index/status/${jobId}`);
  }
};
