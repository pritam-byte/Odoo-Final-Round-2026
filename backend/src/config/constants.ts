import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET: string = process.env.JWT_SECRET || "hackathon_urban_furniture_super_secret_key";
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;