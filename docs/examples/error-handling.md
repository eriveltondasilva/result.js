# Error Handling

## Graceful Degradation

```typescript
async function getRecommendations(userId: string) {
  const mlResult = await fetchMLRecommendations(userId)
  
  return mlResult.orElseAsync(async () => {
    const ruleResult = await fetchRuleBasedRecommendations(userId)
    
    return ruleResult.orElse(() => Result.ok(getPopularProducts()))
  })
}
```

## Error Logging

```typescript
async function fetchWithLogging<T>(url: string): AsyncResultType<T, Error> {
  return (await Result.fromPromise(() => fetch(url).then((r) => r.json())))
    .inspectErr((error) => {
      logger.error('Fetch failed', { url, error })
      metrics.increment('fetch.error')
    })
}
```

## Batch Processing

```typescript
async function batchProcess(items: Item[]) {
  const results = await Promise.all(
    items.map((item) => processItem(item))
  )
  
  const [successes, failures] = Result.partition(results)
  
  return {
    processed: successes.length,
    failed: failures.length,
    errors: failures,
    results: successes
  }
}
```
