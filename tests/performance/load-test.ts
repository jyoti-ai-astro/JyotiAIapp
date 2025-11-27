/**
 * Performance Testing - Load Tests
 * Milestone 9 - Step 2
 * 
 * Load testing for all major APIs
 */

export interface LoadTestResult {
  endpoint: string
  method: string
  requests: number
  concurrency: number
  successRate: number
  averageResponseTime: number
  p50: number
  p95: number
  p99: number
  errors: number
  throughput: number // requests per second
}

/**
 * Load test configuration
 */
export interface LoadTestConfig {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  requests: number
  concurrency: number
  payload?: any
  headers?: Record<string, string>
}

/**
 * Run load test on an endpoint
 */
export async function runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
  const { endpoint, method, requests, concurrency, payload, headers } = config
  const startTime = Date.now()
  const responseTimes: number[] = []
  let successCount = 0
  let errorCount = 0

  // Simulate concurrent requests
  const batches = Math.ceil(requests / concurrency)
  
  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(concurrency, requests - batch * concurrency)
    const promises: Promise<void>[] = []

    for (let i = 0; i < batchSize; i++) {
      promises.push(
        (async () => {
          const requestStart = Date.now()
          try {
            const response = await fetch(endpoint, {
              method,
              headers: {
                'Content-Type': 'application/json',
                ...headers,
              },
              body: payload ? JSON.stringify(payload) : undefined,
            })

            const requestTime = Date.now() - requestStart
            responseTimes.push(requestTime)

            if (response.ok) {
              successCount++
            } else {
              errorCount++
            }
          } catch (error) {
            errorCount++
          }
        })()
      )
    }

    await Promise.all(promises)
  }

  const totalTime = Date.now() - startTime
  const sortedTimes = responseTimes.sort((a, b) => a - b)

  // Calculate percentiles
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0

  const averageResponseTime =
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length || 0

  const successRate = (successCount / requests) * 100
  const throughput = (requests / totalTime) * 1000 // requests per second

  return {
    endpoint,
    method,
    requests,
    concurrency,
    successRate,
    averageResponseTime,
    p50,
    p95,
    p99,
    errors: errorCount,
    throughput,
  }
}

/**
 * Test all major APIs
 */
export async function testAllMajorAPIs(baseUrl: string): Promise<LoadTestResult[]> {
  const results: LoadTestResult[] = []

  // Authentication APIs
  results.push(
    await runLoadTest({
      endpoint: `${baseUrl}/api/auth/magic-link`,
      method: 'POST',
      requests: 100,
      concurrency: 10,
      payload: { email: 'test@example.com' },
    })
  )

  // Kundali APIs
  results.push(
    await runLoadTest({
      endpoint: `${baseUrl}/api/kundali/get`,
      method: 'GET',
      requests: 200,
      concurrency: 20,
      headers: { Cookie: 'session=test-session' },
    })
  )

  // Guru Chat API
  results.push(
    await runLoadTest({
      endpoint: `${baseUrl}/api/guru/chat`,
      method: 'POST',
      requests: 150,
      concurrency: 15,
      payload: { message: 'Test question', contextType: 'general' },
      headers: { Cookie: 'session=test-session' },
    })
  )

  // Reports API
  results.push(
    await runLoadTest({
      endpoint: `${baseUrl}/api/reports/generate`,
      method: 'POST',
      requests: 50,
      concurrency: 5,
      payload: { type: 'basic' },
      headers: { Cookie: 'session=test-session' },
    })
  )

  // Dashboard API
  results.push(
    await runLoadTest({
      endpoint: `${baseUrl}/api/dashboard/summary`,
      method: 'GET',
      requests: 300,
      concurrency: 30,
      headers: { Cookie: 'session=test-session' },
    })
  )

  // Horoscope API
  results.push(
    await runLoadTest({
      endpoint: `${baseUrl}/api/horoscope/today`,
      method: 'GET',
      requests: 200,
      concurrency: 20,
      headers: { Cookie: 'session=test-session' },
    })
  )

  // Notifications API
  results.push(
    await runLoadTest({
      endpoint: `${baseUrl}/api/notifications/list`,
      method: 'GET',
      requests: 250,
      concurrency: 25,
      headers: { Cookie: 'session=test-session' },
    })
  )

  return results
}

/**
 * Performance benchmarks
 */
export const PERFORMANCE_BENCHMARKS = {
  maxResponseTime: 2000, // 2 seconds
  minSuccessRate: 95, // 95%
  maxP95: 3000, // 3 seconds
  minThroughput: 10, // 10 requests per second
}

/**
 * Check if results meet benchmarks
 */
export function checkBenchmarks(results: LoadTestResult[]): {
  passed: boolean
  failures: string[]
} {
  const failures: string[] = []

  results.forEach((result) => {
    if (result.averageResponseTime > PERFORMANCE_BENCHMARKS.maxResponseTime) {
      failures.push(
        `${result.endpoint}: Average response time ${result.averageResponseTime}ms exceeds ${PERFORMANCE_BENCHMARKS.maxResponseTime}ms`
      )
    }

    if (result.successRate < PERFORMANCE_BENCHMARKS.minSuccessRate) {
      failures.push(
        `${result.endpoint}: Success rate ${result.successRate}% below ${PERFORMANCE_BENCHMARKS.minSuccessRate}%`
      )
    }

    if (result.p95 > PERFORMANCE_BENCHMARKS.maxP95) {
      failures.push(
        `${result.endpoint}: P95 ${result.p95}ms exceeds ${PERFORMANCE_BENCHMARKS.maxP95}ms`
      )
    }

    if (result.throughput < PERFORMANCE_BENCHMARKS.minThroughput) {
      failures.push(
        `${result.endpoint}: Throughput ${result.throughput} req/s below ${PERFORMANCE_BENCHMARKS.minThroughput} req/s`
      )
    }
  })

  return {
    passed: failures.length === 0,
    failures,
  }
}

