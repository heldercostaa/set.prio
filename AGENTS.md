# Working in set.priority

- Use `main` as the default and integration branch.
- Start each distinct feature on a separate, descriptive branch. Continue related prompts on the same branch.
- Before creating and switching to a new feature branch, preserve any local work and fetch `origin/main`. Create the new branch directly from the freshly fetched `origin/main`, not from the current feature branch or a stale local `main`. Use a descriptive `helder/` branch name unless the user requests another prefix.
- Keep implementation, verification, and documentation changes local while iterating. Do not push branches or create or update pull requests after individual changes.
- Push changes and create or update a pull request only when the user explicitly requests publication. This applies even when the current branch already has an open pull request.
- Before pushing changes and creating or updating a pull request, fetch `origin/main`, rebase the feature branch onto the latest `origin/main`, and resolve any conflicts. Preserve local work and rerun the relevant checks after the rebase before publishing.
- When publication is requested, target `main` and open the created or updated pull request in the browser. Use the repository's isolated personal GitHub CLI configuration; do not change the company account or global configuration.
- Do not commit or push new work directly to `main`. Merge pull requests only when the user explicitly requests it.
- Use short Conventional Commit messages.
- Use the directory-scoped personal Git identity and isolated authentication. Verify author, committer, signing, and remote before publishing. Preserve Git configuration outside this project directory.
- Use `/caveman lite` communication unless the user explicitly asks otherwise.

- Use GitHub Rebase and merge after all required checks pass.
