/**
 * Reports Hook
 * 
 * Hook for fetching and managing reports
 */

'use client';

import { useState, useCallback } from 'react';
import { reportEngine, type Report, type ReportType } from '@/lib/engines/report-engine';
import { useUserStore } from '@/store/user-store';

export function useReports() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  const generateReport = useCallback(async (type: ReportType, userData?: any): Promise<Report | null> => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const report = await reportEngine.generateReport(type, userData || {});
      setReports(prev => [...prev, report]);

      return report;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate report');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getReport = useCallback((reportId: string): Report | undefined => {
    return reports.find(r => r.reportId === reportId);
  }, [reports]);

  return {
    reports,
    loading,
    error,
    generateReport,
    getReport,
  };
}

