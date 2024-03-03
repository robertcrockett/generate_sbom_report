/**
 * Unit tests for src/sbom.js
 */
const { expect } = require('@jest/globals')
const { Octokit } = require('@octokit/rest')
const { getSBOM } = require('../src/sbom')
const data = require('../__mocks__/sbom_response.json')

// Mock the Octokit module
jest.mock('@octokit/rest')

describe('archiving.js', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Retrieves the json SPDX', async () => {
    const owner = ''
    const repo = 'test'
    const token = ''

    const request = () =>
      new Promise((resolve, reject) => {
        resolve({
          status: 200,
          data: { sbom: `${data}` }
        })
      })
    Octokit.mockImplementation(() => ({ request }))

    expect(await getSBOM(owner, repo, token)).toBe(JSON.stringify(data))
  })

  it('Cannot find repository', async () => {
    const owner = ''
    const repo = 'bogus_repo'
    const token = ''

    // Mock up an error response
    const errResponse = {
      status: 404,
      response: {
        message: 'Not Found',
        status: 404,
        headers: {
          'x-ratelimit-limit': '60'
        }
      }
    }

    // Reject the mocked up error response
    const request = () =>
      new Promise((resolve, reject) => {
        reject(errResponse)
      })
    // Mock the Octokit module and return the mocked up error response
    Octokit.mockImplementation(() => ({ request }))

    await expect(getSBOM(owner, repo, token)).rejects.toThrow(
      'Cannot find repository or file'
    )
  })

  it('Invalid token', async () => {
    const owner = ''
    const repo = ''
    const token = ''

    // Mock up an error response
    const errResponse = {
      status: 403,
      response: {
        message: 'Unauthorized access.',
        status: 403,
        headers: {
          'x-ratelimit-limit': '60'
        }
      }
    }

    // Reject the mocked up error response
    const request = () =>
      new Promise((resolve, reject) => {
        reject(errResponse)
      })
    // Mock the Octokit module and return the mocked up error response
    Octokit.mockImplementation(() => ({ request }))

    await expect(getSBOM(owner, repo, token)).rejects.toThrow(
      'Unauthorized access.'
    )
  })

  it('Testing token rate_limits', async () => {
    const owner = ''
    const repo = ''
    const token = ''

    // Mock up an error response
    const errResponse = {
      status: 403,
      response: {
        message: 'You have exceeded your rate limit.',
        status: 403,
        headers: {
          'x-ratelimit-limit': '0',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1709160095',
          'x-ratelimit-resource': 'core',
          'x-ratelimit-used': '1',
          'x-xss-protection': '0'
        }
      }
    }

    // Reject the mocked up error response
    const request = () =>
      new Promise((resolve, reject) => {
        reject(errResponse)
      })
    // Mock the Octokit module and return the mocked up error response
    Octokit.mockImplementation(() => ({ request }))

    await expect(getSBOM(owner, repo, token)).rejects.toThrow(
      'You have exceeded your rate limit.'
    )
  })
})