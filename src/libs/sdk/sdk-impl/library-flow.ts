import { relinka } from "@reliverse/relinka";
import pAll from "p-all";
import path from "pathe";

import type {
  BundlerName,
  Esbuild,
  ExcludeMode,
  LibConfig,
  NpmOutExt,
  Sourcemap,
  transpileFormat,
  transpileTarget,
} from "~/libs/sdk/sdk-types.js";

import type { PerfTimer } from "./utils/utils-perf.js";

import { library_buildLibrary } from "./build/build-library.js";
import { library_publishLibrary } from "./pub/pub-library.js";
import { CONCURRENCY_DEFAULT, PROJECT_ROOT } from "./utils/utils-consts.js";

/**
 * Processes libraries based on build mode.
 */
export async function processLibraryFlow(
  timer: PerfTimer,
  isDev: boolean,
  libsActMode: string,
  libsList: Record<string, LibConfig>,
  distJsrDryRun: boolean,
  distJsrFailOnWarn: boolean,
  libsDirDist: string,
  libsDirSrc: string,
  commonPubPause: boolean,
  commonPubRegistry: string,
  unifiedBundlerOutExt: NpmOutExt,
  distNpmBuilder: BundlerName,
  coreEntrySrcDir: string,
  rmDepsMode: ExcludeMode,
  rmDepsPatterns: string[],
  transpileEsbuild: Esbuild,
  transpileTarget: transpileTarget,
  transpileFormat: transpileFormat,
  transpileSplitting: boolean,
  transpileSourcemap: Sourcemap,
  transpilePublicPath: string,
  distJsrBuilder: BundlerName,
  transpileStub: boolean,
  transpileWatch: boolean,
  distJsrOutFilesExt: NpmOutExt,
): Promise<void> {
  if (libsActMode !== "libs-only" && libsActMode !== "main-and-libs") {
    relinka(
      "verbose",
      "Skipping libs build/publish as libsActMode is set to 'main-project-only'",
    );
    return;
  }

  await libraries_buildPublish(
    isDev,
    timer,
    libsList,
    distJsrDryRun,
    distJsrFailOnWarn,
    libsDirDist,
    libsDirSrc,
    commonPubPause,
    commonPubRegistry,
    unifiedBundlerOutExt,
    distNpmBuilder,
    coreEntrySrcDir,
    rmDepsMode,
    rmDepsPatterns,
    transpileEsbuild,
    transpileTarget,
    transpileFormat,
    transpileSplitting,
    transpileSourcemap,
    transpilePublicPath,
    distJsrBuilder,
    transpileStub,
    transpileWatch,
    distJsrOutFilesExt,
  );
}

/**
 * Extracts the folder name for a library, handling scoped packages or config overrides.
 */
function extractFolderName(libName: string, libConfig?: LibConfig): string {
  // If user provided a custom directory name, use that
  if (libConfig?.libDirName) {
    return libConfig.libDirName;
  }

  // Otherwise, derive from libName
  const parts = libName.split("/");
  // If scoped (e.g., "@scope/package"), focus on the last chunk
  let baseName = parts[parts.length - 1];

  // If there's a dash, we split on the dash and use the last piece
  if (baseName?.includes("-")) {
    const dashParts = baseName.split("-");
    baseName = dashParts[dashParts.length - 1];
  }

  if (!baseName) {
    baseName = libName;
  }

  return baseName;
}

/**
 * Processes all libs defined in config.libsList.
 * Builds and optionally publishes each library based on configuration.
 */
export async function libraries_buildPublish(
  isDev: boolean,
  timer: PerfTimer,
  libsList: Record<string, LibConfig>,
  distJsrDryRun: boolean,
  distJsrFailOnWarn: boolean,
  libsDirDist: string,
  libsDirSrc: string,
  commonPubPause: boolean,
  commonPubRegistry: string,
  unifiedBundlerOutExt: NpmOutExt,
  distNpmBuilder: BundlerName,
  coreEntrySrcDir: string,
  rmDepsMode: ExcludeMode,
  rmDepsPatterns: string[],
  transpileEsbuild: Esbuild,
  transpileTarget: transpileTarget,
  transpileFormat: transpileFormat,
  transpileSplitting: boolean,
  transpileSourcemap: Sourcemap,
  transpilePublicPath: string,
  distJsrBuilder: BundlerName,
  transpileStub: boolean,
  transpileWatch: boolean,
  distJsrOutFilesExt: NpmOutExt,
): Promise<void> {
  relinka("verbose", "Starting libraries_buildPublish");

  if (!libsList || Object.keys(libsList).length === 0) {
    relinka("info", "No lib configs found in config, skipping libs build.");
    return;
  }

  const libsEntries = Object.entries(libsList);

  // Create a set of build/publish tasks and run them in parallel (concurrency limited)
  const tasks = libsEntries.map(([libName, libConfig]) => {
    return async () => {
      try {
        if (!libConfig.libMainFile) {
          throw new Error(
            `Library ${libName} is missing "libMainFile" property.`,
          );
        }

        // Determine top-level folder name for dist output
        const folderName = extractFolderName(libName, libConfig);
        const libBaseDir = path.resolve(PROJECT_ROOT, libsDirDist, folderName);
        const npmOutDir = path.join(libBaseDir, "npm");
        const jsrOutDir = path.join(libBaseDir, "jsr");

        // Parse the mainFile path
        const libMainPath = path.parse(libConfig.libMainFile);
        const libMainFile = libMainPath.base;
        let libMainDir: string;

        // Check for various path styles
        if (libConfig.libMainFile.startsWith(libsDirSrc)) {
          // Case 1: Fully qualified path already includes libsDirSrc
          libMainDir = libMainPath.dir || ".";
        } else if (libMainPath.dir) {
          // Case 2: Has directory component, but does not start with libsDirSrc
          libMainDir = path.join(libsDirSrc, libMainPath.dir);
        } else {
          // Case 3: Just a filename, use folderName as fallback
          libMainDir = path.join(libsDirSrc, folderName);
        }

        relinka(
          "verbose",
          `Processing library ${libName}: libMainDir=${libMainDir}, libMainFile=${libMainFile}`,
        );

        // If you have a boolean in config controlling minify:
        const libTranspileMinify =
          (libConfig as any)?.libTranspileMinify === true;

        // 1. Build library
        await library_buildLibrary({
          commonPubRegistry,
          libName,
          mainDir: libMainDir,
          npm: {
            npmOutDir,
            distNpmBuilder,
            coreEntrySrcDir,
          },
          jsr: {
            jsrOutDir,
            distJsrBuilder,
            distJsrOutFilesExt,
          },
          libMainFile,
          isDev,
          libsList,
          unifiedBundlerOutExt,
          rmDepsMode,
          rmDepsPatterns,
          transpileEsbuild,
          transpileTarget,
          transpileFormat,
          transpileSplitting,
          libTranspileMinify,
          transpileSourcemap,
          transpilePublicPath,
          timer,
          transpileStub,
          transpileWatch,
        });

        // 2. Publish if not paused
        if (!commonPubPause) {
          await library_publishLibrary(
            commonPubRegistry,
            libName,
            npmOutDir,
            jsrOutDir,
            distJsrDryRun,
            distJsrFailOnWarn,
            false,
            false,
            isDev,
            timer,
          );
        }
      } catch (error) {
        relinka(
          "error",
          `Failed to process library ${libName}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        if (isDev && error instanceof Error) {
          relinka("verbose", `Error details: ${error.stack}`);
        }
        throw error;
      }
    };
  });

  try {
    await pAll(tasks, {
      concurrency: CONCURRENCY_DEFAULT,
    });
    relinka("verbose", "Completed libraries_buildPublish");
  } catch (error) {
    if (error instanceof AggregateError) {
      // For concurrency errors, each error is an entry in the AggregateError
      for (const individualError of error.errors) {
        relinka(
          "error",
          `AggregateError: ${
            individualError instanceof Error
              ? individualError.message
              : String(individualError)
          }`,
        );
      }
    } else {
      relinka(
        "error",
        `Unhandled error in libraries_buildPublish: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    throw error;
  }
}
