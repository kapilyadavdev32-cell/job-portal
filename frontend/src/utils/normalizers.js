export function extractJobs(payload) {
  if (Array.isArray(payload?.data?.jobs)) {
    return payload.data.jobs;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

export function extractCompanies(payload) {
  if (Array.isArray(payload?.data?.companies)) {
    return payload.data.companies;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}
