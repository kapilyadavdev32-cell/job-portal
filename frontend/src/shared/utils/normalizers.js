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

export function extractUser(payload) {
  const data = payload?.data;
  if (data && data._id && !data.user) {
    return data;
  }
  if (data?.user?._id) {
    return data.user;
  }
  return null;
}

export function extractApplications(payload) {
  if (Array.isArray(payload?.data?.applications)) {
    return payload.data.applications;
  }
  return [];
}

export function extractSavedJobs(payload) {
  if (Array.isArray(payload?.data?.savedJobs)) {
    return payload.data.savedJobs;
  }
  return [];
}
