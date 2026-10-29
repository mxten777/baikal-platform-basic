import { createMaintenanceHandler, databaseRpc } from '../_shared/inquiries.ts'

const env = (key: string) => Deno.env.get(key)
Deno.serve(createMaintenanceHandler(env, databaseRpc(env)))
