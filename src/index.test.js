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
