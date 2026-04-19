import { Octokit } from "octokit";

export async function fetchRepoData(
  repoUrl: string,
  accessToken?: string
) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL");

  const [, owner, repo] = match;
  const octokit = new Octokit({ auth: accessToken });

  const [repoData, languages] = await Promise.all([
    octokit.rest.repos.get({ owner, repo }),
    octokit.rest.repos.listLanguages({ owner, repo }),
  ]);

  const r = repoData.data;
  const totalBytes = Object.values(languages.data).reduce(
    (a, b) => a + b,
    0
  );

  return {
    name: r.name,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    openIssues: r.open_issues_count,
    language: r.language,
    languages: Object.entries(languages.data).map(([lang, bytes]) => ({
      lang,
      percentage: Math.round((bytes / totalBytes) * 100),
    })),
    lastCommit: r.updated_at,
    topics: r.topics,
    homepage: r.homepage,
    license: r.license?.name,
    defaultBranch: r.default_branch,
  };
}
