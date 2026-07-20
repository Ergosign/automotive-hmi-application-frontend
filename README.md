# Engineering UI Frontend

Frontend services for the Engineering UI. The user interface is a fork of foxglove 1.70.0 and adapted for in field usage in a driving vehicle.

## Requirements

- [Node.js](https://nodejs.org/en/) v16.10+
- [Git LFS](https://git-lfs.github.com/)

1. Run `git lfs install` in the directory
1. Run `git lfs pull` to ensure Git LFS objects are up to date
1. Run `corepack enable` and `yarn install`
   - If you still get errors about corepack after running `corepack enable`, try uninstalling and reinstalling Node.js. Ensure that Yarn is not separately installed from another source, but is installed _via_ corepack.
1. Launch the development environment:

```sh
# To launch the browser app:
$ yarn web:serve
```

Open the application in a webbrowser at localhost:8080.

Ensure the backend is started and connect the frontend to the foxglove bridge running at `localhost:8765`.
