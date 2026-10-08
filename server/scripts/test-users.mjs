const BASE = 'http://localhost:5000/api/v1'

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe: false }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(`Login failed for ${email}: ${json.error?.message}`)
  return json.data.accessToken
}

async function api(method, path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  return { status: res.status, json }
}

async function run() {
  const suffix = Date.now()
  const companyEmail = `company.${suffix}@bizflow.com`
  const adminEmail = `admin.${suffix}@bizflow.com`
  const managerEmail = `manager.${suffix}@bizflow.com`
  const employeeEmail = `employee.${suffix}@bizflow.com`

  console.log('1. Superadmin login')
  const superToken = await login('superadmin@bizflow.com', 'SuperAdmin123!')
  console.log('   OK')

  console.log('2. Create company + admin')
  let res = await api('POST', '/companies', superToken, {
    companyName: `Test Co ${suffix}`,
    email: companyEmail,
    phone: '+92 300 1234567',
    subscriptionPlan: 'basic',
    startAs: 'active',
    adminFullName: 'Company Admin',
    adminEmail,
    sendInviteEmail: true,
    country: 'pakistan',
    city: 'Lahore',
    addressLine: '123 Test Street',
    postalCode: '54000',
    primaryColor: '#00284F',
    secondaryColor: '#136DEC',
    timezone: 'gmt+5',
    currency: 'pkr',
    dateFormat: 'DD/MM/YYYY',
  })
  if (!res.json.success) throw new Error(res.json.error?.message)
  const companyId = res.json.data?.company?.id
  const adminInviteToken = res.json.data?.devInviteToken
  console.log('   ', res.status, companyId, Boolean(adminInviteToken))

  console.log('3. List companies')
  res = await api('GET', '/companies', superToken)
  console.log('   ', res.status, res.json.data?.companies?.length, 'companies')

  console.log('4. Accept admin invite')
  if (!adminInviteToken) throw new Error('devInviteToken missing — run server in development')
  res = await fetch(`${BASE}/auth/accept-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: adminInviteToken,
      password: 'Admin123!',
      confirmPassword: 'Admin123!',
    }),
  })
  const acceptJson = await res.json()
  if (!acceptJson.success) throw new Error(acceptJson.error?.message)
  console.log('   ', res.status, acceptJson.data?.user?.status)

  console.log('5. Admin login')
  const adminToken = await login(adminEmail, 'Admin123!')
  console.log('   OK')

  console.log('6. Admin creates manager (invite)')
  res = await api('POST', '/users', adminToken, {
    fullName: 'Test Manager',
    email: managerEmail,
    role: 'manager',
    sendInviteEmail: true,
  })
  const managerInviteToken = res.json.data?.devInviteToken
  console.log('   ', res.status, res.json.success, Boolean(managerInviteToken))

  console.log('7. Admin creates employee (invite)')
  res = await api('POST', '/users', adminToken, {
    fullName: 'Test Employee',
    email: employeeEmail,
    role: 'employee',
    sendInviteEmail: true,
  })
  const employeeInviteToken = res.json.data?.devInviteToken
  console.log('   ', res.status, res.json.success, Boolean(employeeInviteToken))

  console.log('8. List users (company scoped)')
  res = await api('GET', '/users', adminToken)
  console.log('   ', res.status, res.json.data?.users?.length, 'users')

  console.log('9. Accept manager invite + login')
  let inviteRes = await fetch(`${BASE}/auth/accept-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: managerInviteToken,
      password: 'Manager123!',
      confirmPassword: 'Manager123!',
    }),
  })
  let inviteJson = await inviteRes.json()
  if (!inviteJson.success) throw new Error('Manager invite failed')
  await login(managerEmail, 'Manager123!')
  console.log('   OK')

  console.log('10. Accept employee invite + login')
  inviteRes = await fetch(`${BASE}/auth/accept-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: employeeInviteToken,
      password: 'Employee123!',
      confirmPassword: 'Employee123!',
    }),
  })
  inviteJson = await inviteRes.json()
  if (!inviteJson.success) throw new Error('Employee invite failed')
  await login(employeeEmail, 'Employee123!')
  console.log('   OK')

  console.log('11. Manager forbidden on /users')
  const managerToken = await login(managerEmail, 'Manager123!')
  res = await api('GET', '/users', managerToken)
  console.log('   ', res.status, res.json.error?.code)

  console.log('12. Superadmin forbidden on /users')
  res = await api('GET', '/users', superToken)
  console.log('   ', res.status, res.json.error?.code)

  console.log('13. Resend company admin invite (expect fail — admin active)')
  res = await api('POST', `/companies/${companyId}/resend-invite`, superToken)
  console.log('   ', res.status, res.json.error?.code)

  console.log('All flow tests passed')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
