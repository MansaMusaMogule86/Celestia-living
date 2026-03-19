import { supabaseAdmin } from '../../lib/supabase'
import mockData from '../../mock-db.json'

export async function migrateToSupabase() {
  console.log('🚀 Starting migration to Supabase...')

  try {
    // 1. Create team
    const { data: team, error: teamError } = await supabaseAdmin
      .from('Team')
      .upsert({
        id: 'default-team-id',
        name: 'Default Team',
        slug: 'default-team'
      })
      .select()
      .single()

    if (teamError) throw teamError
    console.log('✅ Team created:', team.name)

    // 2. Create admin user
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .upsert({
        id: 'admin-user-id',
        email: 'admin@celestialiving.ae',
        passwordHash: '$2a$10$hashedpassword', // You'll need to hash this properly
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        teamId: team.id
      })
      .select()
      .single()

    if (userError) throw userError
    console.log('✅ Admin user created:', user.email)

    // 3. Migrate leads
    if (mockData.leads?.length) {
      const { error: leadsError } = await supabaseAdmin
        .from('Lead')
        .upsert(mockData.leads.map(lead => ({
          ...lead,
          id: lead.id || undefined,
          teamId: team.id,
          assignedToId: user.id
        })))

      if (leadsError) throw leadsError
      console.log(`✅ Migrated ${mockData.leads.length} leads`)
    }

    // 4. Migrate clients
    if (mockData.clients?.length) {
      const { error: clientsError } = await supabaseAdmin
        .from('Client')
        .upsert(mockData.clients.map(client => ({
          ...client,
          id: client.id || undefined,
          teamId: team.id
        })))

      if (clientsError) throw clientsError
      console.log(`✅ Migrated ${mockData.clients.length} clients`)
    }

    // 5. Migrate properties
    if (mockData.properties?.length) {
      const { error: propertiesError } = await supabaseAdmin
        .from('Property')
        .upsert(mockData.properties.map(property => ({
          ...property,
          id: property.id || undefined,
          teamId: team.id
        })))

      if (propertiesError) throw propertiesError
      console.log(`✅ Migrated ${mockData.properties.length} properties`)
    }

    // 6. Migrate deals
    if (mockData.deals?.length) {
      const { error: dealsError } = await supabaseAdmin
        .from('Deal')
        .upsert(mockData.deals.map(deal => ({
          ...deal,
          id: deal.id || undefined,
          teamId: team.id,
          agentId: user.id
        })))

      if (dealsError) throw dealsError
      console.log(`✅ Migrated ${mockData.deals.length} deals`)
    }

    console.log('🎉 Migration complete!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}