import { Request, Response } from "express";
import { MasterService } from "../services/master.service.js";
import { contactSchema, productSchema, analyticSchema } from "../validations/master.validation.js";
import { ContactType, AnalyticType } from "@prisma/client";

// --- CONTACTS ---
export async function getContacts(req: Request, res: Response) {
  try {
    const { search, type } = req.query;
    const contacts = await MasterService.listContacts(
      search as string | undefined,
      type as ContactType | undefined
    );
    return res.json(contacts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createContact(req: Request, res: Response) {
  try {
    const parsed = contactSchema.parse(req.body);
    const contact = await MasterService.createContact(parsed);
    return res.status(201).json(contact);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors?.[0]?.message || error.message });
  }
}

// --- PRODUCTS ---
export async function getProducts(req: Request, res: Response) {
  try {
    const { search } = req.query;
    const products = await MasterService.listProducts(search as string | undefined);
    return res.json(products);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const parsed = productSchema.parse(req.body);
    const product = await MasterService.createProduct(parsed);
    return res.status(201).json(product);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors?.[0]?.message || error.message });
  }
}

// --- ANALYTICS ---
export async function getAnalytics(req: Request, res: Response) {
  try {
    const { type } = req.query;
    const analytics = await MasterService.listAnalytics(type as AnalyticType | undefined);
    return res.json(analytics);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createAnalytic(req: Request, res: Response) {
  try {
    const parsed = analyticSchema.parse(req.body);
    const analytic = await MasterService.createAnalytic(parsed);
    return res.status(201).json(analytic);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors?.[0]?.message || error.message });
  }
}

// --- METADATA (Chart of Accounts & Journals) ---
export async function getAccounts(_req: Request, res: Response) {
  try {
    const accounts = await MasterService.listAccounts();
    return res.json(accounts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getJournals(_req: Request, res: Response) {
  try {
    const journals = await MasterService.listJournals();
    return res.json(journals);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}