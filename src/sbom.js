const { Octokit } = require('@octokit/rest')

/**
 * Returns a json SPDX file representing the SBOM for the GitHub repository.
 *
 * @param owner - The owner of the GitHub repository to retrieve the SBOM from.
 * @param repo - The name of the repository to retrieve the SBOM from.
 * @param token - The GitHub PAT token to use for the request.
 * @returns A Promise representing the SPDX json object.
 *
 */
async function getSBOM(owner, repo, token) {
  // Create a new instance of the GitHub API helper module octokit
  const octokit = new Octokit({
    // Set the authentication token for the request
    auth: `${token}`
  })

  try {
    // Asynchronous request to the retrieve metadata for the specified file
    const response = await octokit.request(
      `GET /repos/${owner}/${repo}/dependency-graph/sbom`,
      {
        // Include the preferred API version
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )

    // The OctokitResponse returns an SPDX json object
    return JSON.stringify(response.data.sbom)
  } catch (error) {
    // Determine if the rate limit has been hit.
    if (
      error.response &&
      error.status === 403 &&
      error.response.headers['x-ratelimit-remaining'] === '0'
    ) {
      // Log an error that the rate limit has been exceeded
      console.log(`You have exceeded your rate limit.`)
      throw new Error('You have exceeded your rate limit.')
    } else if (error.response && error.status === 403) {
      // Log an error that bad credentials were provided
      console.log(`Unauthorized access.`)
      throw new Error('Unauthorized access.')
    } else {
      // Log an error that the respository cannot be found
      console.log(`Cannot find repository or file`)
      throw new Error('Cannot find repository or file')
    }
  }
}

module.exports = { getSBOM }
