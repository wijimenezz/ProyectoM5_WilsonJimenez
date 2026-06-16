import { createOctokit } from "./octokit.js";

const octokit = createOctokit();

const { data } = await octokit.rest.users.getAuthenticated();
console.log("✅ Conectado como:", data.login);
console.log("📊 Repos públicos:", data.public_repos);
