const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const MEET_API_URL = "https://meet.googleapis.com/v2";
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3";
const OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/meetings.space.readonly",
  "https://www.googleapis.com/auth/drive",
].join(" ");

function getRedirectUri() {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;
}

export function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to exchange code: ${await res.text()}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }>;
}

async function getAccessToken() {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh Google access token: ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createMeetEvent({
  summary,
  startTimeIso,
  endTimeIso,
  attendees,
}: {
  summary: string;
  startTimeIso: string;
  endTimeIso: string;
  attendees: string[];
}) {
  const accessToken = await getAccessToken();

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        start: { dateTime: startTimeIso },
        end: { dateTime: endTimeIso },
        attendees: attendees.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to create Meet event: ${await res.text()}`);
  }

  const event = (await res.json()) as {
    id: string;
    hangoutLink: string;
    conferenceData?: { conferenceId?: string };
  };

  return {
    eventId: event.id,
    meetUrl: event.hangoutLink,
    conferenceId: event.conferenceData?.conferenceId,
  };
}

// Looks up the finished conference for a Meet meeting code and returns the
// Drive fileId of its recording, once Google has finished generating it.
// Returns null if the conference hasn't ended yet, or the recording isn't
// ready yet — both are expected, not error, states while polling.
export async function getConferenceRecordingFile(meetingCode: string) {
  const accessToken = await getAccessToken();

  const recordsRes = await fetch(
    `${MEET_API_URL}/conferenceRecords?filter=${encodeURIComponent(`space.meeting_code = "${meetingCode}"`)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!recordsRes.ok) {
    throw new Error(`Failed to list conference records: ${await recordsRes.text()}`);
  }
  const { conferenceRecords } = (await recordsRes.json()) as {
    conferenceRecords?: { name: string; endTime?: string }[];
  };
  const record = conferenceRecords?.find((r) => r.endTime);
  if (!record) return null;

  const recordingsRes = await fetch(`${MEET_API_URL}/${record.name}/recordings`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!recordingsRes.ok) {
    throw new Error(`Failed to list recordings: ${await recordingsRes.text()}`);
  }
  const { recordings } = (await recordingsRes.json()) as {
    recordings?: { state: string; driveDestination?: { file?: string } }[];
  };
  const ready = recordings?.find((r) => r.state === "FILE_GENERATED");
  return ready?.driveDestination?.file ?? null;
}

// Shares a recording file with each email for a limited time (Drive expires
// the permission itself, no code needs to run again to revoke access), and
// returns a link students/teachers can open to watch it.
export async function shareRecording(fileId: string, emails: string[], expiresAt: Date) {
  const accessToken = await getAccessToken();

  for (const email of emails) {
    const res = await fetch(
      `${DRIVE_API_URL}/files/${fileId}/permissions?sendNotificationEmail=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "user",
          role: "reader",
          emailAddress: email,
          expirationTime: expiresAt.toISOString(),
        }),
      },
    );
    if (!res.ok) {
      throw new Error(`Failed to share recording with ${email}: ${await res.text()}`);
    }
  }

  const fileRes = await fetch(`${DRIVE_API_URL}/files/${fileId}?fields=webViewLink`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!fileRes.ok) {
    throw new Error(`Failed to fetch recording link: ${await fileRes.text()}`);
  }
  const { webViewLink } = (await fileRes.json()) as { webViewLink: string };
  return webViewLink;
}

export async function deleteRecording(fileId: string) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete recording: ${await res.text()}`);
  }
}
