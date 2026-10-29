import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

// Run with: node --test scripts\auth-provider.test.mjs
function loadModule(relativePath, modules) {
  const path = new URL(relativePath, import.meta.url)
  const compiled = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    reportDiagnostics: true,
  })
  assert.equal(compiled.diagnostics.length, 0)
  const exports = {}
  vm.runInNewContext(compiled.outputText, {
    exports, Error,
    require(name) {
      assert.ok(Object.hasOwn(modules, name), `Unexpected import: ${name}`)
      return modules[name]
    },
  }, { filename: path.pathname })
  return exports
}

const admin = { id: 'admin', app_metadata: { role: 'admin' }, user_metadata: {} }
const ordinary = { id: 'ordinary', app_metadata: {}, user_metadata: {} }
const metadataOnly = {
  id: 'metadata-only', app_metadata: {}, user_metadata: { role: 'admin' },
}
const sessionFor = user => user ? { user, access_token: 'mock-token' } : null
const jsx = (type, props) => ({ type, props })
const jsxRuntime = { jsx, jsxs: jsx, Fragment: 'fragment' }

async function authHarness(initialUser = null, options = {}) {
  const states = []
  let cursor = 0
  let effect
  let authListener
  let cleanup
  let signOutCalls = 0
  let unsubscribed = false
  let credentials
  const auth = {
    async getSession() {
      return { data: { session: sessionFor(initialUser) } }
    },
    onAuthStateChange(callback) {
      authListener = callback
      return { data: { subscription: {
        unsubscribe() { unsubscribed = true },
      } } }
    },
    async signInWithPassword(input) {
      credentials = input
      if (options.signInError) {
        return { data: { user: null }, error: options.signInError }
      }
      authListener('SIGNED_IN', sessionFor(options.loginUser ?? admin))
      return { data: { user: options.loginUser ?? admin }, error: null }
    },
    async signOut() {
      signOutCalls++
      if (options.signOutError) return { error: options.signOutError }
      authListener('SIGNED_OUT', null)
      return { error: null }
    },
  }
  const { AuthProvider } = loadModule('../src/features/auth/AuthProvider.tsx', {
    react: {
      createContext: () => ({ Provider: 'provider' }),
      useContext: () => { throw new Error('Unexpected useContext') },
      useState(initial) {
        const index = cursor++
        if (!(index in states)) states[index] = initial
        return [states[index], value => { states[index] = value }]
      },
      useEffect(callback) { effect = callback },
    },
    'react/jsx-runtime': jsxRuntime,
    '@/lib/supabase': { supabase: { auth } },
  })
  function render() {
    cursor = 0
    return AuthProvider({ children: 'admin-ui' }).props.value
  }
  assert.equal(render().isLoading, true)
  cleanup = effect()
  await Promise.resolve()
  return {
    render,
    emit(event, user) { authListener(event, sessionFor(user)) },
    cleanup() { cleanup() },
    get signOutCalls() { return signOutCalls },
    get credentials() { return credentials },
    get unsubscribed() { return unsubscribed },
  }
}

function protectedRoute(context) {
  const { default: ProtectedRoute } = loadModule('../src/routes/ProtectedRoute.tsx', {
    '@/features/auth/AuthProvider': { useAuth: () => context },
    'react-router-dom': { Navigate: 'navigate' },
    'react/jsx-runtime': jsxRuntime,
  })
  return ProtectedRoute({ children: 'admin-menu-and-page' })
}

test('restored sessions grant admin only from app_metadata', async () => {
  for (const [user, allowed] of [
    [admin, true],
    [ordinary, false],
    [metadataOnly, false],
    [{ ...metadataOnly, app_metadata: { role: 'user' } }, false],
    [{ ...admin, user_metadata: { role: 'user' } }, true],
    [null, false],
  ]) {
    const harness = await authHarness(user)
    const state = harness.render()
    assert.equal(state.isLoading, false)
    assert.equal(state.isAdmin, allowed)
    const route = protectedRoute(state)
    if (allowed) {
      assert.equal(route.props.children, 'admin-menu-and-page')
    } else {
      assert.equal(route.type, 'navigate')
      assert.equal(route.props.to, '/login')
    }
    harness.cleanup()
    assert.equal(harness.unsubscribed, true)
  }
})

test('admin login succeeds even when user_metadata disagrees', async () => {
  const harness = await authHarness(null, {
    loginUser: { ...admin, user_metadata: { role: 'user' } },
  })
  await harness.render().signIn('admin@example.test', 'mock-password')
  assert.equal(harness.render().isAdmin, true)
  assert.equal(harness.credentials.email, 'admin@example.test')
  assert.equal(harness.signOutCalls, 0)
})

test('ordinary and user-metadata-only logins are rejected and signed out', async () => {
  for (const user of [
    ordinary,
    metadataOnly,
    { ...metadataOnly, app_metadata: { role: 'user' } },
  ]) {
    const harness = await authHarness(null, { loginUser: user })
    await assert.rejects(
      harness.render().signIn('user@example.test', 'mock-password'),
      /관리자 권한이 없는 계정입니다/,
    )
    assert.equal(harness.signOutCalls, 1)
    assert.equal(harness.render().isAdmin, false)
    assert.equal(harness.render().session, null)
  }
})

test('login authentication errors are propagated', async () => {
  const error = new Error('mock invalid credentials')
  const harness = await authHarness(null, { signInError: error })
  await assert.rejects(
    harness.render().signIn('user@example.test', 'mock-password'),
    error,
  )
  assert.equal(harness.render().isAdmin, false)
  assert.equal(harness.signOutCalls, 0)
})

test('token refresh and user updates immediately recalculate route access', async () => {
  const harness = await authHarness(admin)
  harness.emit('TOKEN_REFRESHED', metadataOnly)
  assert.equal(harness.render().isAdmin, false)
  assert.equal(protectedRoute(harness.render()).props.to, '/login')
  harness.emit('TOKEN_REFRESHED', admin)
  assert.equal(harness.render().isAdmin, true)
  harness.emit('USER_UPDATED', ordinary)
  assert.equal(harness.render().isAdmin, false)
  harness.emit('SIGNED_OUT', null)
  assert.equal(harness.render().user, null)
  assert.equal(harness.render().session, null)
})

test('logout clears session and removes protected UI access', async () => {
  const harness = await authHarness(admin)
  await harness.render().signOut()
  assert.equal(harness.render().user, null)
  assert.equal(harness.render().session, null)
  assert.equal(harness.render().isAdmin, false)
  assert.equal(protectedRoute(harness.render()).props.to, '/login')
})

test('logout failures are propagated rather than reported as success', async () => {
  const error = new Error('mock sign-out failure')
  const harness = await authHarness(admin, { signOutError: error })
  await assert.rejects(harness.render().signOut(), error)
})

test('protected route never renders admin UI while restoring the session', () => {
  const route = protectedRoute({ user: admin, isAdmin: true, isLoading: true })
  assert.equal(route.type, 'div')
})
