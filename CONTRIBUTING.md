# Contributing

We welcome contributions from the community and are happy to have them! The top priorities for contribution at the moment are as follows:

- **Rust Bindings:** We'd like to have Rust bindings for both the writer and reader libraries so that they may be used in native mobile applications.

And in general, we're always looking for help with:

- **Documentation:** We'd like to have more comprehensive documentation for both the writer and reader libraries.
- **Testing:** We'd like to have more comprehensive testing for both the writer and reader libraries.
- **Performance:** We'd like to have more performant implementations of both the writer and reader libraries.
- **Bug Fixes:** If you find a bug, please feel free to open an issue or a pull request.

## Getting Started

Everything is written in Typescript and installed/run via PNPM. If you don't have PNPM installed, you can install it via NPM:

```bash
npm install -g pnpm
```

Once you have PNPM installed, you can install the dependencies for the entire project by running:

```bash
pnpm install
```

From there, you'll have access to the following commands:

- `pnpm dev`: Starts the development server for the web app, which is very handy for visually testing the reader and writer libraries.
- `pnpm build`: Builds all of the packages in the project.
- `pnpm test`: Runs the tests for all of the packages in the project.
- `pnpm test:watch`: Runs the tests for all of the packages in the project in watch mode.
- `pnpm lint`: Lints all of the packages in the project.
- `pnpm benchmark`: Runs the benchmarks for all of the packages in the project.

## Making Contributions

All contributions must be formatted using Prettier and pass linting in order to be committed. All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard. This is enforced via a pre-commit hook, so you don't have to worry about it.

## Rules of Engagement

- **Be nice:** We're all here to help each other. Let's be kind to one another.
- **Be patient:** We're all busy people. Sometimes it takes a while for someone to get back to you. This is free, open-source software. We're all doing this in our spare time - so have a little patience.
- **Be helpful:** We're all at different stages in our careers. If you see someone struggling, offer them a hand. If you're struggling, ask for help.
- **Take matters into your own hands:** If you see something that needs doing or a bug that needs patching, try to do it yourself.
