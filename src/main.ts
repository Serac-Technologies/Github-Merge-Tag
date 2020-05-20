import * as core from '@actions/core'
import { GitHub, context } from '@actions/github'

const BRANCH_REGEX = /(?:feature|hotfix|bugfix)\/ST-(?:[0-9]+)/

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token')
    const branch = core.getInput('branch')
    const sha = process.env.GITHUB_SHA || ''

    const fixTag = (rawBranch: string): string => {
      if (BRANCH_REGEX.test(rawBranch)) return rawBranch.split('/')[1]
      return rawBranch
    }

    const tag = fixTag(branch)

    const octokit = new GitHub(token)

    const newTag = await octokit.git.createTag({
      ...context.repo,
      tag,
      message: tag,
      object: sha,
      type: 'commit',
    })

    await octokit.git.createRef({
      ...context.repo,
      ref: `refs/tags/${tag}`,
      sha: newTag.data.sha,
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
