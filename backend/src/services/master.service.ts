import { prisma } from "../lib/prisma.js";
import { ContactType, ProductType, AnalyticType, Prisma } from "@prisma/client";

export class MasterService {
  // --- CONTACTS ---
  static async listContacts(search?: string, type?: ContactType) {
    const where: Prisma.ContactWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type && type !== ContactType.BOTH) {
      where.OR = [{ type }, { type: ContactType.BOTH }];
    }
    return prisma.contact.findMany({ where, orderBy: { name: "asc" } });
  }

  static async createContact(data: {
    name: string;
    type: ContactType;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    image?: string;
  }) {
    return prisma.contact.create({ data });
  }

  // --- PRODUCTS ---
  static async listProducts(search?: string) {
    const where: Prisma.ProductWhereInput = search
      ? { name: { contains: search, mode: "insensitive" } }
      : {};
    return prisma.product.findMany({ where, orderBy: { name: "asc" } });
  }

  static async createProduct(data: {
    name: string;
    category?: string;
    salesPrice: number;
    cost: number;
    type: ProductType;
    image?: string;
  }) {
    return prisma.product.create({
      data: {
        ...data,
        salesPrice: new Prisma.Decimal(data.salesPrice),
        cost: new Prisma.Decimal(data.cost),
      },
    });
  }

  // --- ANALYTICS ---
  static async listAnalytics(type?: AnalyticType) {
    const where: Prisma.AnalyticWhereInput = type ? { type } : {};
    return prisma.analytic.findMany({ where, orderBy: { name: "asc" } });
  }

  static async createAnalytic(data: { name: string; type: AnalyticType }) {
    return prisma.analytic.create({ data });
  }

  // --- CHART OF ACCOUNTS & JOURNALS (Read Only for forms) ---
  static async listAccounts() {
    return prisma.chartOfAccount.findMany({ orderBy: { name: "asc" } });
  }

  static async listJournals() {
    return prisma.journal.findMany({
      include: { defaultAccount: true },
      orderBy: { name: "asc" },
    });
  }
}