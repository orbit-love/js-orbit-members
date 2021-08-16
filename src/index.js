const pkg = require("../package.json");
const axios = require("axios");
const qs = require("querystring");

class OrbitMembers {
  constructor(orbitWorkspaceId, orbitApiKey, userAgent) {
    this.credentials = this.setCredentials(
      orbitWorkspaceId,
      orbitApiKey,
      userAgent
    );
  }

  setCredentials(orbitWorkspaceId, orbitApiKey, userAgent) {
    if (
      !(orbitWorkspaceId || process.env.ORBIT_WORKSPACE_ID) ||
      !(orbitApiKey || process.env.ORBIT_API_KEY)
    ) {
      throw new Error(
        "You must provide and Orbit Workspace ID and Orbit API Key"
      );
    }
    return {
      orbitWorkspaceId: orbitWorkspaceId || process.env.ORBIT_WORKSPACE_ID,
      orbitApiKey: orbitApiKey || process.env.ORBIT_API_KEY,
      userAgent: userAgent || `js-orbit-members/${pkg.version}`,
    };
  }

  async createMember(data) {
    try {
      if (!data) throw new Error("You must provide data");
      if (typeof data !== "object") throw new Error("data must be an object");
      const response = await this.api(
        this.credentials,
        "POST",
        "/members",
        null,
        data
      );
      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  updateMember(data) {
    return this.createMember(data);
  }

  async api(credentials, method, endpoint, query = {}, data = {}) {
    try {
      if (!credentials || !method || !endpoint)
        throw new Error("You must pass a client, method, and endpoint");

      const url = `https://app.orbit.love/api/v1/${
        credentials.orbitWorkspaceId
      }${endpoint}?${qs.encode(query)}`;

      const response = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${credentials.orbitApiKey}`,
          "User-Agent": credentials.userAgent,
        },
      });

      return response?.data;
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = OrbitMembers;
