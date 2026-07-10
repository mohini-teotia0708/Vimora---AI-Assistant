"use client";

import { useCallback, useMemo, useState } from "react";
import { TokenSource } from "livekit-client";
import { useSession } from "@livekit/components-react";
import type { AppConfig } from "@/app-config";
import { AgentSessionProvider } from "@/components/agents-ui/agent-session-provider";
import { StartAudioButton } from "@/components/agents-ui/start-audio-button";
import { BootScreen } from "@/app/components/boot-screen";
import { ViewController } from "@/app/components/view-controller";
import { useAgentErrors } from "@/hooks/useAgentErrors";
import { useDebugMode } from "@/hooks/useDebug";
import { getSandboxTokenSource } from "@/lib/utils";

const IN_DEVELOPMENT = process.env.NODE_ENV !== "production";

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();
  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  console.log("APP_CONFIG client side:", appConfig);
  const [bootComplete, setBootComplete] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

  const tokenSource = useMemo(() => {
    return typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === "string"
      ? getSandboxTokenSource(appConfig)
      : TokenSource.endpoint("/api/token");
  }, [appConfig]);

  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined,
  );

  return (
    <>
      {/* Boot screen overlay — always rendered until complete */}
      {!bootComplete && <BootScreen onComplete={handleBootComplete} />}

      {/* Main app */}
      <AgentSessionProvider session={session}>
        <AppSetup />
        <main
          className="grid h-svh grid-cols-1 place-content-center"
          style={{
            opacity: bootComplete ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <ViewController appConfig={appConfig} />
        </main>
        <StartAudioButton label="Start Audio" />
      </AgentSessionProvider>
    </>
  );
}
