import { apiRequest } from "../../../shared/api/client.js";

export function fetchHealthcheck() {
  return apiRequest("/healthcheck");
}
