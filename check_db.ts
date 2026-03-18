
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const leads = await prisma.lead.findMany()
  const clients = await prisma.client.findMany()
  const transactions = await prisma.transaction.findMany()
  const teams = await prisma.team.findMany()

  console.log('Leads:', leads.length)
  leads.forEach(l => console.log(`  - ${l.firstName} ${l.lastName} (Team: ${l.teamId})`))
  
  console.log('Clients:', clients.length)
  console.log('Transactions:', transactions.length)
  console.log('Teams:', teams.length)
  teams.forEach(t => console.log(`  - ${t.name} (${t.id})`))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
