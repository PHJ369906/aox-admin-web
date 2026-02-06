import request from '../utils/request'

/**
 * 定时任务监控 API
 */

/**
 * 定时任务信息类型
 */
export interface ScheduledJob {
  jobName: string
  jobDescription: string
  cronExpression: string
  jobHandler: string
  executorParam: string
  status: number
  lastExecutionTime: string
  nextExecutionTime: string
  executionCount: number
  successCount: number
  failCount: number
}

/**
 * 任务执行日志类型
 */
export interface JobExecutionLog {
  logId: number
  jobName: string
  executionTime: string
  executionDuration: number
  status: number
  result: string
  errorMessage?: string
}

/**
 * 任务统计数据类型
 */
export interface JobStatistics {
  totalJobs: number
  runningJobs: number
  stoppedJobs: number
  todayExecutions: number
  todaySuccessCount: number
  todayFailCount: number
  successRate: number
}

/**
 * 获取任务列表
 */
export const getJobList = () => {
  return request.get('/v1/admin/scheduled-jobs')
}

/**
 * 获取任务执行日志
 */
export const getJobExecutionLogs = (jobName?: string, limit: number = 10) => {
  return request.get('/v1/admin/scheduled-jobs/logs', {
    params: { jobName, limit }
  })
}

/**
 * 手动触发任务
 */
export const triggerJob = (jobName: string) => {
  return request.post('/v1/admin/scheduled-jobs/trigger', null, {
    params: { jobName }
  })
}

/**
 * 获取任务统计数据
 */
export const getJobStatistics = () => {
  return request.get('/v1/admin/scheduled-jobs/statistics')
}
