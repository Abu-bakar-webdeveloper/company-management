const AUTH_BASE = 'http://localhost:5000/api/v1/auth'
const API_BASE = 'http://localhost:5000/api/v1'

function parseSetCookie(res) {
  const cookies = res.headers.getSetCookie?.() ?? []
  return cookies.join('; ')
}

async function requestAuth(path, { method = 'GET', body, token, cookie } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (cookie) headers.Cookie = cookie

  const res = await fetch(`${AUTH_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = await res.json()
  return { status: res.status, json, cookies: parseSetCookie(res) }
}

async function run() {
  console.log('1. Superadmin login')
  const loginRes = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'superadmin@bizflow.com',
      password: 'SuperAdmin123!',
      rememberMe: true,
    }),
  })
  const loginJson = await loginRes.json()
  if (!loginJson.success) {
    throw new Error(`Login failed: ${loginJson.error?.message}`)
  }
  const refreshCookie = (loginRes.headers.getSetCookie?.() ?? [])[0]?.split(';')[0] ?? ''
  const accessToken = loginJson.data?.accessToken
  console.log('   OK', loginJson.data?.user?.role)

  console.log('2. Me')
  const meRes = await requestAuth('/me', { token: accessToken })
  console.log('   ', meRes.status, meRes.json.data?.user?.companyId)

  console.log('3. Refresh')
  const refreshRes = await requestAuth('/refresh', { method: 'POST', cookie: refreshCookie })
  console.log('   ', refreshRes.status, refreshRes.json.success)

  console.log('4. Pending admin cannot login')
  const pendingLogin = await requestAuth('/login', {
    method: 'POST',
    body: { email: 'pending@example.com', password: 'Any1234!', rememberMe: false },
  })
  console.log('   ', pendingLogin.status, pendingLogin.json.error?.code ?? 'n/a')

  console.log('5. Accept invite (invalid token)')
  const badInvite = await requestAuth('/accept-invite', {
    method: 'POST',
    body: { token: 'invalid', password: 'Valid123!', confirmPassword: 'Valid123!' },
  })
  console.log('   ', badInvite.status, badInvite.json.error?.code)

  console.log('6. Forgot password')
  const forgotRes = await requestAuth('/forgot-password', {
    method: 'POST',
    body: { email: 'superadmin@bizflow.com' },
  })
  console.log('   ', forgotRes.status, forgotRes.json.success)

  console.log('7. Wrong password')
  const badLogin = await requestAuth('/login', {
    method: 'POST',
    body: { email: 'superadmin@bizflow.com', password: 'wrong', rememberMe: false },
  })
  console.log('   ', badLogin.status, badLogin.json.error?.code)

  console.log('8. Logout')
  const newCookie = refreshRes.cookies?.split(';')[0] ?? refreshCookie
  const logoutRes = await requestAuth('/logout', { method: 'POST', cookie: newCookie })
  console.log('   ', logoutRes.status, logoutRes.json.success)

  console.log('All auth tests completed')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
