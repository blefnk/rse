# Relidler: Reliverse Bundler

[💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [✨ Repo](https://github.com/reliverse/relidler-js-bundler) • [📦 NPM](https://npmjs.com/@reliverse/relidler) • [📚 Docs](https://docs.reliverse.org)

**@reliverse/relidler** is a flexible, unified, and fully automated bundler for TypeScript and JavaScript projects, as well as an NPM and JSR publishing tool.

## Features

- 😘 Drop-in replacement for `unbuild`
- ⚡ `relidler` works via CLI and SDK
- 📦 Automated NPM/JSR publishing
- ✅ Ensures reliable JS/TS builds
- 🔄 Handles automatic version bumps
- 🔧 Eliminates `package.json` headaches
- 🎯 Optimized for speed and modern workflows
- 🛠️ Converts TypeScript aliases to relative paths
- ✨ Packed with powerful features under the hood
- 📝 Highly configurable flow via a configuration file
- 🔌 Plugin system with two built-in plugins included

## Getting Started

Ensure [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org), and a package manager ([bun](https://bun.sh)/[pnpm](https://pnpm.io)/[yarn](https://yarnpkg.com)/[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)) are installed. Then follow these steps:

### Example Playground

Want to test Relidler before integrating it into your project? Clone the repo and build it using Relidler itself:

```sh
git clone https://github.com/reliverse/relidler.git
cd relidler
bun i
bun dev # bun src/main.ts --dev
```

### Relidler Usage

1. **Install globally**:

    ```sh
    bun i -g @reliverse/relidler
    ```

    **Or update as needed**:

    ```sh
    bun -g update --latest
    ```

2. **Prepare your project**:

    a. **Configure `.gitignore`**:

    ```sh
    echo "*.log" >> .gitignore
    echo "dist-npm" >> .gitignore
    echo "dist-jsr" >> .gitignore
    echo "dist-libs" >> .gitignore
    ```

    b. **Install config intellisense**:

    ```sh
    bun add -D @reliverse/relidler-cfg
    ```

    c. **Initialize `relidler.cfg.ts`**:

    ```sh
    relidler
    ```

    - The `relidler.cfg.ts` file is automatically created on first run.
    - **It's recommended to customize this file according to your needs.**
    - Supported filenames: `relidler.cfg.ts` • `relidler.config.ts` • `build.pub.ts` • `build.cfg.ts`.
    - You can check an example config here: [relidler.cfg.ts](https://github.com/reliverse/relidler-js-bundler/blob/main/relidler.cfg.ts)

3. **Run and enjoy**:

    ```sh
    relidler
    ```

## Plugins

Relidler includes a plugin system with **two built-in** plugins:

### 1. `libraries-relidler-plugin`

Builds and publishes specified subdirectories of your main project as separate packages.

**Usage example**: The `@reliverse/relidler-cfg` configuration for [src/libs/cfg](https://github.com/reliverse/relidler-js-bundler/tree/main/src/libs/cfg) dir:

```ts
// relidler.cfg.ts
libsActMode: "main-and-libs",
libsDirDist: "dist-libs",
libsDirSrc: "src/libs",
libsList: {
  "@reliverse/relidler-cfg": {
    libDeclarations: true,
    libDescription: "@reliverse/relidler defineConfig",
    libDirName: "cfg",
    libMainFile: "cfg/cfg-main.ts",
    libPkgKeepDeps: false,
    libTranspileMinify: true,
  },
},
```

### 2. `tools-relidler-plugin`

Enables you to run specific Relidler features:

```bash
relidler tools --tool <tool> --input <dir> --out <file> [options]
```

**Available tools**:

- `agg`: Generates aggregator file with content like `export { getSomething } from "./utils.js"`. **Note**: Currently it replaces the file content, not appends.

**Usage example**: If you're exploring the [Example Playground](#example-playground), you can try the following:

1. Open [src/libs/sdk/sdk-main.ts](https://github.com/reliverse/relidler-js-bundler/blob/main/src/libs/sdk/sdk-main.ts) in your IDE.
2. Press `Ctrl+A`, then `Backspace`. Run the command below and watch the magic happen:

```bash
bun tools:agg # Shortcut for:
bun src/main.ts tools --dev --tool agg --input src/libs/sdk/sdk-impl --out src/libs/sdk/sdk-main.ts --recursive --named --strip src/libs/sdk
```

## API (for advanced users)

The SDK allows you to create new Relidler plugins or even extend your own CLI functionality.

```sh
bun add -D @reliverse/relidler-sdk
```

**Usage example**: [@reliverse/cli](https://github.com/reliverse/cli-website-builder) leverages this SDK to extend its functionality.

## TODO

- [x] ~~Implement stable `regular` build and publish~~
- [ ] Implement stable `library` build and publish
- [ ] Achieve full drop-in replacement for `unbuild`
- [ ] Support auto migration from `build.config.ts`
- [ ] Allow plugins to extend Relidler's `defineConfig`
- [ ] Support configuration via `reliverse.{ts,jsonc}`
- [ ] Make config file optional with sensible defaults

## Related

Special thanks to the project that inspired Relidler:

- [unjs/unbuild](https://github.com/unjs/unbuild)

## License

🩷 [MIT](./LICENSE) © [blefnk Nazar Kornienko](https://github.com/blefnk)
