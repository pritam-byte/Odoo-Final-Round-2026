import { prisma } from "../src/lib/prisma.js";

async function checkContacts() {
  const list = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  console.log("==================================================");
  console.log(`📋 Total Contacts in PostgreSQL Database: ${list.length}`);
  console.log("==================================================");
  console.table(
    list.map((c) => ({
      ID: c.id.slice(0, 8) + "...",
      Name: c.name,
      Type: c.type,
      Email: c.email,
      Phone: c.phone || "N/A",
      City: c.city || "N/A",
      "Created At": c.createdAt.toLocaleString(),
    }))
  );
}

checkContacts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
