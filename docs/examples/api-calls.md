# API Calls

## Basic Fetch

```typescript
type ApiError = { status: number; message: string }

async function fetchUser(id: string): AsyncResultType<User, ApiError> {
  return Result.fromPromise(
    async () => {
      const response = await fetch(`/api/users/${id}`)
      
      if (!response.ok) {
        throw { status: response.status, message: await response.text() }
      }
      
      return response.json()
    },
    (err): ApiError => 
      typeof err === 'object' && err !== null && 'status' in err
        ? err as ApiError
        : { status: 500, message: String(err) }
  )
}
```

## With Retry Logic

```typescript
async function fetchWithRetry<T>(
  url: string,
  maxRetries = 3
): AsyncResultType<T, ApiError> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await Result.fromPromise(
      async () => {
        const response = await fetch(url)
        if (!response.ok) throw new Error(response.statusText)
        return response.json()
      }
    )
    
    if (result.isOk()) return result
    
    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** i))
    }
  }
  
  return Result.err({ status: 500, message: 'Max retries exceeded' })
}
```

## Parallel Requests

```typescript
async function loadDashboard(userId: string) {
  const results = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchFollowers(userId)
  ])
  
  return Result.all(results).map(([user, posts, followers]) => ({
    user,
    posts,
    followers
  }))
}
```
