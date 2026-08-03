"use client";

import { JitsiMeeting } from "@jitsi/react-sdk";

export function JitsiRoom({
  domain,
  roomName,
  displayName,
  email,
}: {
  domain: string;
  roomName: string;
  displayName: string;
  email: string;
}) {
  return (
    <JitsiMeeting
      domain={domain}
      roomName={roomName}
      userInfo={{ displayName, email }}
      configOverwrite={{
        startWithAudioMuted: true,
        prejoinPageEnabled: true,
      }}
      interfaceConfigOverwrite={{
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      }}
      getIFrameRef={(iframeRef) => {
        iframeRef.style.height = "100%";
        iframeRef.style.width = "100%";
      }}
    />
  );
}
