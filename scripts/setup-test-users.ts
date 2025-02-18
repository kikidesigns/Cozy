import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@supabase/supabase-js"

import type { Database } from "../types/supabase"

// Load environment variables from .env file
dotenv.config()

const supabaseUrl = 'https://omthgqplimfvukqytmns.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env file')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function main() {
  try {
    // Create test user through auth admin API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password',
      email_confirm: true
    })

    let userId: string
    if (userError) {
      if (userError.message.includes('already been registered')) {
        // User exists, get their ID
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError

        const existingUser = users.find(u => u.email === 'test@example.com')
        if (!existingUser) throw new Error('Could not find existing user')

        userId = existingUser.id
        console.log('Using existing user:', userId)
      } else {
        throw userError
      }
    } else {
      userId = userData.user.id
      console.log('Created test user:', userId)
    }

    // Create or update test user profile using service role client
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: 'TestUser',
        bitcoin_balance: 1000,
        is_npc: false
      })

    if (profileError) throw profileError
    console.log('Created test profile:', userId)

    // Create NPC agents
    const agents = [
      { name: 'Agent1', balance: 500 },
      { name: 'Agent2', balance: 750 }
    ]

    const agentIds: string[] = []
    const agentData: Record<string, string> = {}

    for (const agent of agents) {
      const agentId = uuidv4()

      // Create NPC profile directly (no auth user needed)
      const { error: agentError } = await supabase
        .from('profiles')
        .upsert({
          id: agentId,
          username: agent.name,
          bitcoin_balance: agent.balance,
          is_npc: true
        })

      if (agentError) {
        console.error(`Error creating agent ${agent.name}:`, agentError)
        continue
      }

      agentIds.push(agentId)
      agentData[agent.name] = agentId
      console.log(`Created agent ${agent.name} with ID:`, agentId)
    }

    // Save agent IDs to a file
    const configPath = path.join(process.cwd(), 'src', 'config')
    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath, { recursive: true })
    }

    fs.writeFileSync(
      path.join(configPath, 'npcAgents.json'),
      JSON.stringify(agentData, null, 2)
    )

    console.log('\nSetup complete!')
    console.log('Test user email: test@example.com')
    console.log('Test user password: password')
    console.log('\nAgent IDs have been saved to src/config/npcAgents.json')
    console.log('\nAgent IDs:')
    agents.forEach((agent, index) => {
      console.log(`${agent.name}: ${agentIds[index]}`)
    })

  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

main()
