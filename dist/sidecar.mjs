import { startSidecarServer } from "./sidecar/server.mjs";
startSidecarServer()
  .then((running) => {
    for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
      process.on(sig, () => { running.close().finally(() => process.exit(0)); });
    }
  })
  .catch((err) => {
    console.error("GCP Companion sidecar failed to start:", err);
    process.exit(1);
  });
