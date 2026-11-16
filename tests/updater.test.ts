import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  GITHUB_CLONE_URL,
  GITHUB_REPO_URL,
  PLUGIN_ID,
  PluginUpdater,
  compareSemver,
  parseSemver,
} from "../src/core/updater.ts";

describe("PluginUpdater (Auto-Check & 3-Tier GitHub Update Engine)", () => {
  it("parses and compares semantic versions accurately", () => {
    assert.deepEqual(parseSemver("1.2.3"), [1, 2, 3]);
    assert.deepEqual(parseSemver("v2.10.0-beta.1"), [2, 10, 0]);
    assert.equal(parseSemver("not-a-version"), null);

    assert.equal(compareSemver("1.2.0", "1.1.9"), 1);
    assert.equal(compareSemver("1.10.0", "1.2.0"), 1);
    assert.equal(compareSemver("1.1.0", "1.1.0"), 0);
    assert.equal(compareSemver("1.0.9", "1.1.0"), -1);
  });

  it("detects newer GitHub version and auto-updates via agy CLI when autoUpdate is enabled", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "agy-updater-test-"));
    try {
      const bootDir = join(tmp, "boot-plugin");
      const globalPluginsDir = join(tmp, "global-plugins");
      const installedDir = join(globalPluginsDir, PLUGIN_ID);
      mkdirSync(bootDir, { recursive: true });
      mkdirSync(installedDir, { recursive: true });

      writeFileSync(
        join(bootDir, "plugin.json"),
        JSON.stringify({ name: PLUGIN_ID, version: "1.1.0" })
      );
      writeFileSync(
        join(installedDir, "plugin.json"),
        JSON.stringify({ name: PLUGIN_ID, version: "1.1.0" })
      );

      const executedCalls: Array<{ bin: string; args: readonly string[] }> = [];

      const updater = new PluginUpdater({
        pluginRootDir: bootDir,
        globalPluginsDir,
        agyBinaryPath: "/usr/local/bin/agy",
        gitBinaryPath: null,
        fetchFn: async () =>
          new Response(JSON.stringify({ name: PLUGIN_ID, version: "1.2.0" }), { status: 200 }),
        execFn: async (bin, args) => {
          executedCalls.push({ bin, args });
          // Simulate `agy plugin install` updating plugin.json on disk to 1.2.0
          writeFileSync(
            join(installedDir, "plugin.json"),
            JSON.stringify({ name: PLUGIN_ID, version: "1.2.0" })
          );
          return { stdout: "[ok] installed", stderr: "" };
        },
      });

      const status = await updater.checkForUpdates({ force: true, autoUpdate: true });
      assert.equal(executedCalls.length, 1);
      assert.equal(executedCalls[0].bin, "/usr/local/bin/agy");
      assert.deepEqual(executedCalls[0].args, ["plugin", "install", GITHUB_REPO_URL]);
      assert.equal(status.currentVersion, "1.1.0");
      assert.equal(status.latestVersion, "1.2.0");
      assert.equal(status.updatedToVersion, "1.2.0");
      assert.equal(status.restartRequired, true);
      assert.equal(status.updateAvailable, false);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("supports manual check without auto-install when autoUpdate=false, and falls back to atomic git clone when agy is absent", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "agy-updater-git-fallback-"));
    try {
      const bootDir = join(tmp, "boot-plugin");
      const globalPluginsDir = join(tmp, "global-plugins");
      const installedDir = join(globalPluginsDir, PLUGIN_ID);
      mkdirSync(bootDir, { recursive: true });
      mkdirSync(installedDir, { recursive: true });

      writeFileSync(
        join(bootDir, "plugin.json"),
        JSON.stringify({ name: PLUGIN_ID, version: "1.1.0" })
      );
      writeFileSync(
        join(installedDir, "plugin.json"),
        JSON.stringify({ name: PLUGIN_ID, version: "1.1.0" })
      );

      let cloneCalled = false;
      const updater = new PluginUpdater({
        pluginRootDir: bootDir,
        globalPluginsDir,
        agyBinaryPath: null,
        gitBinaryPath: "/usr/bin/git",
        fetchFn: async () =>
          new Response(JSON.stringify({ name: PLUGIN_ID, version: "1.3.0" }), { status: 200 }),
        execFn: async (_bin, args) => {
          cloneCalled = true;
          assert.equal(args[0], "clone");
          assert.ok(args.includes(GITHUB_CLONE_URL));
          const stagingTarget = args[args.length - 1];
          mkdirSync(join(stagingTarget, "dist"), { recursive: true });
          writeFileSync(
            join(stagingTarget, "plugin.json"),
            JSON.stringify({ name: PLUGIN_ID, version: "1.3.0" })
          );
          writeFileSync(join(stagingTarget, "dist", "sidecar.mjs"), "// ok");
          return { stdout: "", stderr: "" };
        },
      });

      const checkOnly = await updater.checkForUpdates({ force: true, autoUpdate: false });
      assert.equal(cloneCalled, false);
      assert.equal(checkOnly.updateAvailable, true);
      assert.equal(checkOnly.latestVersion, "1.3.0");

      const applied = await updater.applyUpdate(false, false);
      assert.equal(cloneCalled, true);
      assert.equal(applied.updatedToVersion, "1.3.0");
      assert.equal(applied.restartRequired, true);
      assert.equal(applied.updateAvailable, false);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("never overwrites symlinked developer directories during auto-update or manual update", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "agy-updater-symlink-"));
    try {
      const devRepoDir = join(tmp, "dev-repo");
      const globalPluginsDir = join(tmp, "global-plugins");
      mkdirSync(devRepoDir, { recursive: true });
      mkdirSync(globalPluginsDir, { recursive: true });
      writeFileSync(
        join(devRepoDir, "plugin.json"),
        JSON.stringify({ name: PLUGIN_ID, version: "1.1.0" })
      );
      symlinkSync(devRepoDir, join(globalPluginsDir, PLUGIN_ID));

      let execInvoked = false;
      const updater = new PluginUpdater({
        pluginRootDir: devRepoDir,
        globalPluginsDir,
        agyBinaryPath: "/usr/local/bin/agy",
        fetchFn: async () =>
          new Response(JSON.stringify({ name: PLUGIN_ID, version: "1.4.0" }), { status: 200 }),
        execFn: async () => {
          execInvoked = true;
          return { stdout: "", stderr: "" };
        },
      });

      const status = await updater.checkForUpdates({ force: true, autoUpdate: true });
      assert.equal(execInvoked, false, "Should skip auto-updating symlinked dev directory");
      assert.equal(status.updateAvailable, true);

      await assert.rejects(() => updater.applyUpdate(true, false), /development symlink/);
      assert.equal(execInvoked, false);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
