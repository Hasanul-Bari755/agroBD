import { getOrderByUserId } from "@/models/oreder.model";
import axios from "axios";
export async function getOrder(userId) {
  const data = await getOrderByUserId(userId);
  return data;
}