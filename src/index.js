const pkg = require("../package.json");
const axios = require("axios");
const qs = require("querystring");

class OrbitMembers {
  constructor(orbitWorkspaceId, orbitApiKey, userAgent) {
    this.credentials = this.setCredentials(
      orbitWorkspaceId,
      orbitApiKey,
      userAgent
    )
  }

  setCredentials(orbitWorkspaceId, orbitApiKey, userAgent) {
    if (
      !(orbitWorkspaceId || process.env.ORBIT_WORKSPACE_ID) ||
      !(orbitApiKey || process.env.ORBIT_API_KEY)
    ) {
      throw new Error(
        'You must provide and Orbit Workspace ID and Orbit API Key'
      )
    }
    return {
      orbitWorkspaceId: orbitWorkspaceId || process.env.ORBIT_WORKSPACE_ID,
      orbitApiKey: orbitApiKey || process.env.ORBIT_API_KEY,
      userAgent: userAgent || `js-orbit-members/${pkg.version}`
    }
  }

  async createMember(data) {
    try {
      if (!data) throw new Error('You must provide data')
      if (typeof data !== 'object') throw new Error('data must be an object')
      const response = await this.api(
        this.credentials,
        'POST',
        '/members',
        null,
        data
      )
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  updateMember(memberId, data) {
    if (memberId && data) {
      return this.updateMemberWithId(memberId, data)
    } else {
      data = memberId
      return this.updateMemberWithoutId(data)
    }
  }

  async updateMemberWithId(memberId, data) {
    try {
      if (!memberId)
        throw new Error('You must provide a memberId as the first parameter')
      if (!data)
        throw new Error(
          'You must provide a data object as the second parameter'
        )
      await this.api(
        this.credentials,
        'PUT',
        `/members/${memberId}`,
        null,
        data
      )
      return `member ${memberId} updated`
    } catch (error) {
      throw new Error(error)
    }
  }

  async updateMemberWithoutId(data) {
    this.createMember(data)
  }

  async listMembers(query = {}) {
    try {
      const response = await this.api(
        this.credentials,
        'GET',
        '/members',
        query
      )

      const nextPage = getNextPageFromURL(response?.links?.next)
      return {
        data: response.data,
        included: response.included,
        items: response.data.length,
        nextPage
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async getMember(memberId) {
    try {
      if (!memberId) throw new Error('You must provide an memberId')
      const response = await this.api(
        this.credentials,
        'GET',
        `/members/${memberId}`
      )
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  async findMember(query) {
    try {
      if (!query) throw new Error('You must provide a query')
      if (!query.source || (!query.username && !query.uid && !query.email))
        throw new Error(
          'You must provide a source and one of username/uid/email'
        )
      const response = await this.api(
        this.credentials,
        'GET',
        '/members/find',
        query
      )
      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  async api(credentials, method, endpoint, query = {}, data = {}) {
    try {
      if (!credentials || !method || !endpoint)
        throw new Error('You must pass a client, method, and endpoint')

      const url = `https://app.orbit.love/api/v1/${
        credentials.orbitWorkspaceId
      }${endpoint}?${qs.encode(query)}`

      const response = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${credentials.orbitApiKey}`,
          'User-Agent': credentials.userAgent
        }
      })

      return response?.data
    } catch (err) {
      throw new Error(err)
    }
  }
}

function getNextPageFromURL(url) {
  if (!url) return null
  const search = url.split('?')[1]
  const page = +qs.decode(search).page
  return page
}


module.exports = OrbitMembers;
