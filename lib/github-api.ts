import { Octokit } from 'octokit';
import { prisma } from './prisma';

export async function getGitHubClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'github',
    },
  });

  if (!account?.access_token) {
    return null;
  }

  return new Octokit({ auth: account.access_token });
}

export async function syncGitHubRepos(userId: string) {
  const octokit = await getGitHubClient(userId);
  if (!octokit) return { success: false, error: 'GitHub not connected' };

  try {
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    // Sync repos to local projects
    for (const repo of repos) {
      await prisma.project.upsert({
        where: { id: `github-${repo.id}` },
        update: {
          title: repo.name,
          description: repo.description || '',
          githubRepo: repo.full_name,
          githubData: repo as any,
          demoUrl: repo.homepage,
          techTags: repo.topics || [],
        },
        create: {
          id: `github-${repo.id}`,
          ownerId: userId,
          title: repo.name,
          description: repo.description || '',
          githubRepo: repo.full_name,
          githubData: repo as any,
          demoUrl: repo.homepage,
          techTags: repo.topics || [],
          githubSynced: true,
        },
      });
    }

    return { success: true, repos: repos.length };
  } catch (error) {
    return { success: false, error: 'Failed to sync with GitHub' };
  }
}

export async function getRepoContents(owner: string, repo: string, path: string = '', userId: string) {
  const octokit = await getGitHubClient(userId);
  if (!octokit) return { success: false, error: 'GitHub not connected' };

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    return { success: true, contents: data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch repository contents' };
  }
}

export async function getRepoCommits(owner: string, repo: string, userId: string) {
  const octokit = await getGitHubClient(userId);
  if (!octokit) return { success: false, error: 'GitHub not connected' };

  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 50,
    });

    return { success: true, commits: data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch commits' };
  }
}

export async function getPullRequests(owner: string, repo: string, userId: string) {
  const octokit = await getGitHubClient(userId);
  if (!octokit) return { success: false, error: 'GitHub not connected' };

  try {
    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 50,
    });

    return { success: true, pullRequests: data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch pull requests' };
  }
}
