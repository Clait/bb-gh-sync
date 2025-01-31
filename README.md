# Bitbucket to GitHub Repo Sync

This project is a Node.js application that listens for webhooks from Bitbucket and syncs the corresponding repositories on GitHub. It ensures that changes made in Bitbucket are reflected in the GitHub repositories.

## Features

- Listens for webhooks from Bitbucket.
- Checks if the corresponding repository exists on GitHub.
- Syncs the GitHub repository with changes from Bitbucket.

## Prerequisites

- Node.js 22
- npm (Node Package Manager)
- Docker (optional, for running the app in a container)

## Installation

1. Clone the repository:

    ```sh
    git clone https://your-repo-url.git
    cd your-repo-directory
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the root of the project and add the following environment variables:

    ```sh
    GITHUB_USER=your-github-username
    GITHUB_TOKEN=your-github-token
    BITBUCKET_REPO_URL=bitbucket-repo-clone-url
    GITHUB_REPO_URL=github-repo-clone-url
    PORT=3000
    ```

## Usage

To start the application, run the following command:

```sh
npm start
```

The app will start listening for webhooks on port 3000.

## Testing

To run the tests, use the following command:

```sh
npm test
```

## Docker

To build and run the application inside a Docker container:

1. Build the Docker image:

    ```sh
    docker build -t bb-gh-sync .
    ```

2. Run the Docker container:

    ```sh
    docker run -p 3000:3000 bb-gh-sync
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your changes.

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Jest](https://jestjs.io/)
- [Docker](https://www.docker.com/)
- [simple-git](https://github.com/steveukx/git-js)
