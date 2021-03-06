const OrbitMembers = require("./index.js");
const axios = require("axios");
const url = require("url");

jest.mock("axios");

describe("OrbitMembers constructor", () => {
  it("given all credentials, does not throw", () => {
    const sut = new OrbitMembers("1", "2");
    expect(sut).not.toBeNull();
  });

  it("given missing configuration values, throws", () => {
    delete process.env.ORBIT_WORKSPACE_ID;
    delete process.env.ORBIT_API_KEY;

    expect(() => {
      new OrbitMembers(null, null);
    }).toThrow();
  });

  it("configuration read from env variables when not directly provided", () => {
    process.env.ORBIT_WORKSPACE_ID = "1";
    process.env.ORBIT_API_KEY = "2";

    const sut = new OrbitMembers(null, null);

    expect(sut.credentials.orbitWorkspaceId).toBe("1");
    expect(sut.credentials.orbitApiKey).toBe("2");
  });

  it("given no user agent, the default is set correctly", () => {
    const sut = new OrbitMembers("1", "2");
    expect(sut.credentials.userAgent).toContain("js-orbit-members/");
  });

  it("given a user agent, it is set correctly", () => {
    const sut = new OrbitMembers("1", "2", "3");
    expect(sut.credentials.userAgent).toBe("3");
  });
});

describe("OrbitMembers api", () => {
  let sut;
  beforeEach(() => {
    sut = new OrbitMembers("1", "2");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("missing all required parameters, throws", async () => {
    await expect(sut.api()).rejects.toThrow(
      "You must pass a client, method, and endpoint"
    );
  });

  it("missing some required parameters, throws", async () => {
    await expect(sut.api("1", "2")).rejects.toThrow(
      "You must pass a client, method, and endpoint"
    );
  });

  it("calls axios correctly based on params", async () => {
    const toReturn = { data: [{ key: "value" }] };
    axios.mockResolvedValueOnce(toReturn);

    await sut.api(
      sut.credentials,
      "3",
      "/4",
      { queryKey: "queryValue" },
      { dataKey: "dataValue" }
    );

    const firstCall = axios.mock.calls[0][0];

    expect(axios).toHaveBeenCalledTimes(1);
    expect(firstCall.headers.Authorization).toBe("Bearer 2");
    expect(firstCall.method).toBe("3");
    expect(firstCall.data.dataKey).toBe("dataValue");
    expect(url.parse(firstCall.url, true).query.queryKey).toBe("queryValue");
  });
});

describe('OrbitMembers createMember', () => {
  let sut
  beforeEach(() => {
    sut = new OrbitMembers('1', '2')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('given no data, throws', async () => {
    await expect(sut.createMember()).rejects.toThrow('You must provide data')
  })

  it('given data is not an object, throws', async () => {
    const errorText = 'data must be an object'
    await expect(sut.createMember(123)).rejects.toThrow(errorText)
    await expect(sut.createMember(true)).rejects.toThrow(errorText)
    await expect(sut.createMember('string')).rejects.toThrow(errorText)
  })

  it('returns data in the correct format', async () => {
    const toReturn = { data: { data: { prop: 'val' } } }
    axios.mockResolvedValue(toReturn)
    const response = await sut.createMember({})
    expect(response).toMatchObject(toReturn.data)
  })

  it('given an error, return error', async () => {
    const errorMessage = 'Network Error'
    axios.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage))
    })

    await expect(sut.createMember({})).rejects.toThrow(errorMessage)
  })
})

describe('OrbitMembers listMembers', () => {
  let sut
  beforeEach(() => {
    sut = new OrbitMembers('1', '2')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns data in the correct format', async () => {
    const toReturn = setMembersResponse({ nextPage: 3 })
    axios.mockResolvedValueOnce(toReturn)

    const response = await sut.listMembers()

    expect(response.data.length).toBe(2)
    expect(response.data.included).not.toBeNull()
    expect(response.items).toBe(2)
    expect(response.nextPage).toBe(3)
  })

  it('given nextPageUrl, provides nextPage integer, ', async () => {
    const toReturn = setMembersResponse({ nextPage: 3 })
    axios.mockResolvedValueOnce(toReturn)

    const response = await sut.listMembers()

    expect(response.nextPage).toBe(3)
  })

  it('given no nextPageUrl, sets nextPage to null, ', async () => {
    const toReturn = setMembersResponse({ nextPage: null })
    axios.mockResolvedValueOnce(toReturn)

    const response = await sut.listMembers()

    expect(response.nextPage).toBeNull()
  })

  it('given an error, return error', async () => {
    const errorMessage = 'Network Error'
    axios.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage))
    })

    await expect(sut.listMembers()).rejects.toThrow(errorMessage)
  })
})

describe('OrbitMembers getMember', () => {
  let sut
  beforeEach(() => {
    sut = new OrbitMembers('1', '2')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('if memberId is missing, throws', async () => {
    await expect(sut.getMember()).rejects.toThrow(
      'You must provide an memberId'
    )
  })

  it('returns data in correct format', async () => {
    const toReturn = { data: { data: { id: 'id-val' }, included: [] } }
    axios.mockResolvedValueOnce(toReturn)

    const response = await sut.getMember('123')

    expect(response.data.id).toBe('id-val')
    expect(response.included).not.toBeNull()
  })

  it('given an error, return error', async () => {
    const errorMessage = 'Network Error'
    axios.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage))
    })

    await expect(sut.getMember('123')).rejects.toThrow(errorMessage)
  })
})

describe('OrbitMembers updateMember', () => {
  let sut
  beforeEach(() => {
    sut = new OrbitMembers('1', '2')
  })

  it('given one argument which is an object, call updateMemberWithoutId', () => {
    const spy = jest.spyOn(sut, 'updateMemberWithoutId')
    sut.updateMember({})
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('given a memberId and an object, call updateMemberWithId', () => {
    const spy = jest.spyOn(sut, 'updateMemberWithId')
    sut.updateMember('123', {})
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('OrbitMembers updateMemberWithoutId', () => {
  it('calls createMember', () => {
    const sut = new OrbitMembers('1', '2')
    const spy = jest.spyOn(sut, 'createMember')
    sut.updateMember({})
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('OrbitMembers updateMemberWithId', () => {
  let sut
  beforeEach(() => {
    sut = new OrbitMembers('1', '2')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('if parameters are missing, throws', async () => {
    await expect(sut.updateMemberWithId()).rejects.toThrow(
      'You must provide a memberId as the first parameter'
    )
    await expect(sut.updateMemberWithId('1')).rejects.toThrow(
      'You must provide a data object as the second parameter'
    )
  })

  it('calls axios correctly', async () => {
    axios.mockResolvedValueOnce({})

    await sut.updateMember('123', { dataKey: 'dataValue' })

    const firstCall = axios.mock.calls[0][0]
    const path = url
      .parse(firstCall.url, true)
      .path.split('v1')[1]
      .split('?')[0]
    const memberId = path.split('/')[3]

    expect(memberId).toBe('123')
  })

  it('returns success message correctly', async () => {
    axios.mockResolvedValueOnce({})

    const response = await sut.updateMember('123', {
      dataKey: 'dataValue'
    })

    expect(response).toBe('member 123 updated')
  })

  it('given an error, return error', async () => {
    const errorMessage = 'Network Error'
    axios.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage))
    })

    await expect(sut.updateMember('1', {})).rejects.toThrow(errorMessage)
  })
})

describe('OrbitMembers findMember', () => {
  let sut
  beforeEach(() => {
    sut = new OrbitMembers('1', '2')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('if query is missing, throws', async () => {
    await expect(sut.findMember()).rejects.toThrow('You must provide a query')
  })

  it('if required params are missing, throws', async () => {
    const errorText = 'You must provide a source and one of username/uid/email'
    await expect(sut.findMember({})).rejects.toThrow(errorText)
    await expect(sut.findMember({ prop: 'value' })).rejects.toThrow(errorText)
    await expect(sut.findMember({ source: 'value' })).rejects.toThrow(errorText)
  })

  it('returns data in correct format', async () => {
    const toReturn = { data: { data: { id: 'id-val' }, included: [] } }
    axios.mockResolvedValueOnce(toReturn)

    const response = await sut.findMember({ source: '1', uid: '2' })

    expect(response.data.id).toBe('id-val')
    expect(response.included).not.toBeNull()
  })

  it('given an error, return error', async () => {
    const errorMessage = 'Network Error'
    axios.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage))
    })

    await expect(sut.findMember({ source: '1', uid: '2' })).rejects.toThrow(
      errorMessage
    )
  })
})

describe('OrbitMembers addIdentity', () => {
  let sut
  beforeEach(() => {
    sut = new OrbitMembers('1', '2')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('given required parameters are missing, throws', async () => {
    const errorText = 'You must provide a memberId string and data object'
    await expect(sut.addIdentity()).rejects.toThrow(errorText)
    await expect(sut.addIdentity('123')).rejects.toThrow(errorText)
  })

  it('given required parameters are the wrong types, throws', async () => {
    const memberIdError = 'You must provide memberId as a string'
    const dataError = 'You must provide data as an object'

    await expect(sut.addIdentity(123, {})).rejects.toThrow(memberIdError)
    await expect(sut.addIdentity(true, {})).rejects.toThrow(memberIdError)
    await expect(sut.addIdentity({}, {})).rejects.toThrow(memberIdError)
    await expect(sut.addIdentity('123', 123)).rejects.toThrow(dataError)
    await expect(sut.addIdentity('123', true)).rejects.toThrow(dataError)
    await expect(sut.addIdentity('123', 'string')).rejects.toThrow(dataError)
  })

  it('given missing source, throws', async () => {
    await expect(sut.addIdentity('123', {})).rejects.toThrow(
      'You must provide a source'
    )
  })

  it('returns data in the correct format', async () => {
    const toReturn = { data: { data: { prop: 'val' } } }
    axios.mockResolvedValue(toReturn)
    const response = await sut.addIdentity('123', { source: '123' })
    expect(response).toMatchObject(toReturn.data)
  })

  it('given an error, return error', async () => {
    const errorMessage = 'Network Error'
    axios.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage))
    })

    await expect(sut.addIdentity('123', { source: '123' })).rejects.toThrow(
      errorMessage
    )
  })
})

describe('OrbitMembers removeIdentity', () => {
  let sut
  beforeEach(() => {
    sut = new OrbitMembers('1', '2')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('given required parameters are missing, throws', async () => {
    const errorText = 'You must provide a memberId string and data object'
    await expect(sut.removeIdentity()).rejects.toThrow(errorText)
    await expect(sut.removeIdentity('123')).rejects.toThrow(errorText)
  })

  it('given required parameters are the wrong types, throws', async () => {
    const memberIdError = 'You must provide memberId as a string'
    const dataError = 'You must provide data as an object'

    await expect(sut.removeIdentity(123, {})).rejects.toThrow(memberIdError)
    await expect(sut.removeIdentity(true, {})).rejects.toThrow(memberIdError)
    await expect(sut.removeIdentity({}, {})).rejects.toThrow(memberIdError)
    await expect(sut.removeIdentity('123', 123)).rejects.toThrow(dataError)
    await expect(sut.removeIdentity('123', true)).rejects.toThrow(dataError)
    await expect(sut.removeIdentity('123', 'string')).rejects.toThrow(dataError)
  })

  it('given missing source, throws', async () => {
    await expect(sut.removeIdentity('123', {})).rejects.toThrow(
      'You must provide a source'
    )
  })

  it('returns data in the correct format', async () => {
    axios.mockResolvedValueOnce({})
    const response = await sut.removeIdentity('123', { source: '123' })
    expect(response).toBe('identity on member 123 removed')
  })

  it('given an error, return error', async () => {
    const errorMessage = 'Network Error'
    axios.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage))
    })

    await expect(sut.removeIdentity('123', { source: '123' })).rejects.toThrow(
      errorMessage
    )
  })
})

describe('OrbitMembers deleteMember', () => {
  let sut
  beforeEach(() => {
    sut = new OrbitMembers('1', '2')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('given memberId is missing, throws', async () => {
    await expect(sut.deleteMember()).rejects.toThrow(
      'You must provide a memberId'
    )
  })

  it('calls axios correctly', async () => {
    axios.mockResolvedValueOnce({})

    await sut.deleteMember('123')

    const firstCall = axios.mock.calls[0][0]
    const path = url
      .parse(firstCall.url, true)
      .path.split('v1')[1]
      .split('?')[0]
    const memberId = path.split('/')[3]

    expect(memberId).toBe('123')
  })

  it('returns data in the correct format', async () => {
    axios.mockResolvedValueOnce({})
    const response = await sut.deleteMember('123')
    expect(response).toBe('member 123 deleted')
  })

  it('given an error, return error', async () => {
    const errorMessage = 'Network Error'
    axios.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage))
    })

    await expect(sut.deleteMember('123', { source: '123' })).rejects.toThrow(
      errorMessage
    )
  })
})

function setMembersResponse(params) {
  const next = params?.nextPage
    ? `https://app.orbit.love/api/v1/workspaceid/members?filters=true&items=25&page=${params.nextPage}&sort=occurred_at`
    : null
  return {
    data: {
      data: [{}, {}],
      included: [],
      links: {
        next
      }
    }
  }
}
