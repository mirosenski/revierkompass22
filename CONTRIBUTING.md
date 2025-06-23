# Contributing to RevierKompass

**Author**: MiniMax Agent

First off, thank you for considering contributing to RevierKompass! It's people like you that make open source such a great community. We welcome any and all contributions, from bug reports to feature requests and code changes.

This document provides a set of guidelines for contributing to the project, which are designed to make the contribution process as smooth and transparent as possible.

## 1. Development Environment Setup

To get started with the RevierKompass codebase, you'll need to set up your local development environment.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/mirosenski/revierkompass.git
    cd revierkompass
    ```

2.  **Install dependencies**:

    The project uses `pnpm` for package management. Install the dependencies from the root of the monorepo:

    ```bash
    pnpm install
    ```

3.  **Run the development server**:

    You can start the development server for the web application using Turborepo's `dev` script:

    ```bash
    pnpm dev
    ```

    This will start the Vite development server, and you can view the application at `http://localhost:5173`.

## 2. Code Style and Quality Standards

To maintain a consistent and high-quality codebase, we use a set of automated tools.

- **Linter and Formatter**: We use [Biome](https://biomejs.dev/) for both linting and formatting. It's configured at the root of the monorepo in the `biome.json` file. Before you commit any code, please run the formatter:

  ```bash
  pnpm format
  ```

- **TypeScript**: The entire codebase is written in TypeScript. Please follow best practices for writing clean, readable, and type-safe code.
- **Component Design**: When creating new React components, please adhere to the following principles:
  - Keep components small and focused on a single responsibility.
  - Use the shared UI components from the `packages/ui` directory whenever possible.
  - Write components to be stateless whenever possible, lifting state up to higher-level components or the Zustand store.

## 3. Testing Requirements and Procedures

We are in the process of setting up a comprehensive testing suite. While we don't have a formal testing framework in place yet, we encourage you to manually test your changes thoroughly.

- **Manual Testing**: Before submitting a pull request, please test your changes in a browser to ensure that they work as expected and do not introduce any regressions.
- **Future Plans**: We plan to introduce [Vitest](https://vitest.dev/) for unit and integration testing, and [Playwright](https://playwright.dev/) for end-to-end testing.

## 4. Git Workflow and Branching Strategy

We follow a simple Git workflow based on feature branches.

1.  **Create a feature branch**: When you start working on a new feature or bug fix, create a new branch from the `main` branch:

    ```bash
    git checkout -b feature/your-feature-name
    ```

2.  **Commit your changes**: Make your changes and commit them with a clear and descriptive commit message.

3.  **Push your branch**: Push your branch to the remote repository:

    ```bash
    git push origin feature/your-feature-name
    ```

4.  **Create a pull request**: Open a pull request from your feature branch to the `main` branch. Provide a clear description of your changes and any relevant context.

## 5. Pull Request Guidelines

- **Title**: The pull request title should be clear and concise, summarizing the changes.
- **Description**: The description should provide a detailed overview of the changes, including the motivation for the change and any relevant context. If the pull request closes an issue, please include `Closes #<issue-number>` in the description.
- **Review**: All pull requests must be reviewed and approved by at least one other contributor before they can be merged.

## 6. Release Process

We do not have a formal release process in place yet. The `main` branch is considered the production branch, and all changes are deployed to the live application upon being merged.

## 7. Troubleshooting Common Issues

- **Dependency issues**: If you encounter any issues with dependencies, try deleting the `node_modules` directory and the `pnpm-lock.yaml` file, and then run `pnpm install` again.
- **Build issues**: If you have any problems with the build process, make sure you are using a compatible version of Node.js and pnpm.

If you have any other questions, please feel free to open an issue on GitHub.
