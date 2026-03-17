import { apiRequest } from "./client.js";

export function fetchHealthcheck() {
  return apiRequest("/healthcheck");
}
