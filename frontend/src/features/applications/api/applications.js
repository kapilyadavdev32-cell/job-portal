import { apiRequest } from "../../../shared/api/client.js";

export function uploadUserResume(file) {
  const body = new FormData();
  body.append("resume", file);

  return apiRequest("/users/me/resume", {
    method: "POST",
    body,
  });
}

export function importResumeFromDrive(resumeUrl) {
  return apiRequest("/users/me/resume/import", {
    method: "POST",
    body: JSON.stringify({ resumeUrl }),
  });
}

async function resolveResumePayload(payload) {
  if (payload.resumeFile) {
    const result = await uploadUserResume(payload.resumeFile);
    return result?.data?.resume;
  }

  if (payload.resumeDriveUrl) {
    const result = await importResumeFromDrive(payload.resumeDriveUrl);
    return result?.data?.resume;
  }

  return payload.resume;
}

export async function createApplication(payload) {
  const resume = await resolveResumePayload(payload);

  return apiRequest("/applications", {
    method: "POST",
    body: JSON.stringify({
      job: payload.job,
      coverLetter: payload.coverLetter,
      resume,
    }),
  });
}

export function fetchApplications() {
  return apiRequest("/applications");
}
