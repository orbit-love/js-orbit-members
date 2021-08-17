# Orbit Members Helper Library for Node.js

![Build Status](https://github.com/orbit-love/js-orbit-members/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/%40orbit-love%2Fmembers.svg)](https://badge.fury.io/js/%40orbit-love%2Fmembers)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](.github/CODE_OF_CONDUCT.md)

> Orbit API helper library for Node.js. <br>This client can create, read, update and delete members and identities in your Orbit workspace.

<img src=".github/logo.png" alt="Orbit" style="max-width: 300px; margin: 2em 0;">

## Installation

```
npm install @orbit-love/members
```

## Constructor

```js
const OrbitMembers = require('@orbit-love/members')
const orbitMembers = new OrbitMembers(orbitWorkspaceId, orbitApiKey)
```

* `orbitWorkspaceId` - The part of your Orbit workspace URL that immediately follows the app.orbit.love. For example, if the URL was https://app.orbit.love/my-workspace, then your Orbit workspace ID is my-workspace.
* `orbitApiKey` - This can be found in you Orbit Account Settings.

### Initializing with environment variables

If you have the environment variables `ORBIT_WORKSPACE_ID` and `ORBIT_API_KEY` set, you can initialize the client like so:

```js
const OrbitMembers = require('@orbit-love/members')
const orbitMembers = new OrbitMembers()
```

If you have environment variables set and also pass in values, the passed in values will be used.

## Rate Limits & Page Sizes

- [Information about Orbit API Rate Limiting](https://docs.orbit.love/reference#rate-limiting)
- For list methods, you can ask request a number of results per request between 1 and 100.

## Methods

<details>
<summary><code>listMembers(query)</code></summary>

```js
const query = {
    page: 1,
    items: 50,
    company: 'ACME Corp'
}

orbitMembers.listMembers(query).then(data => {
    console.log(data)
}).catch(error => {
    console.error(error)
})
```

`options` is not a required parameter, but can include any query parameter shown in our API reference.

[List members in a workspace API reference](https://docs.orbit.love/reference/get_-workspace-id-members)
</details>

<details>
<summary><code>getMember(memberId)</code></summary>

```js
const memberId = 'janesmith04'

getMember(memberId).then(data => {
    console.log(data)
}).catch(error => {
    console.error(error)
})
```

[Get a member API reference](https://docs.orbit.love/reference/get_-workspace-id-members-id)
</details>

<details>
<summary><code>findMember(query)</code></summary>

```js
const query = {
    source: 'youtube',
    username: 'janesmith1990'
}

orbitMembers.findMember(query).then(data => {
    console.log(data)
}).catch(error => {
    console.error(error)
})
```

Provide a source and one of username/uid/email params to return a member with that identity, if one exists. Common values for `source` include `github`, `twitter`, and `email`.

[Fine a member by an identity API reference](https://docs.orbit.love/reference/get_-workspace-id-members-find)
</details>

<details>
<summary><code>createMember(data)</code></summary>

```js
const data = {
    member: {
        twitter: 'janesmith_',
        name: 'jane Smith',
        tags: ['champion', 'feedback']
    }
}

orbitMembers.createMember(data).then(data => {
    console.log(data)
}).catch(error => {
    console.error(error)
})

```

[Create a member API reference](https://docs.orbit.love/reference/post_-workspace-id-members)
</details>

<details>
<summary><code>updateMember([memberId], data)</code></summary>

```js
const memberId = 'janesmith04'
const data = {
    bio: 'New bio'
}

orbitMembers.updateMember(memberId, data).then(data => {
    console.log(data)
}).catch(error => {
    console.error(error)
})
```

You can omit `memberId` and provide only the data object, but you must then provide an identity object.

[Update a member with memberID API Reference](https://docs.orbit.love/reference/put_-workspace-id-members-id)

[Update a member without memberId API reference](https://docs.orbit.love/reference/post_-workspace-id-members)
</details>

<details>
<summary><code>deleteMember(memberId)</code></summary>

```js
const memberId = 'janesmith04'

orbitMembers.deleteMember(memberId).then(data => {
    console.log(data)
}).catch(error => {
    console.error(error)
})
```

[Delete a member API reference](https://docs.orbit.love/reference/delete_-workspace-id-members-id)

</details>

<details>
<summary><code>addIdentity(memberId, data)</code></summary>

```js
const memberId = 'janesmith04'
const data = {
    source: 'youtube',
    username: 'janesmith1990'
}

orbitMembers.addIdentity(memberId, data).then(data => {
    console.log(data)
}).catch(error => {
    console.error(error)
})
```
</details>

<details>
<summary><code>removeIdentity(memberId, data)</code></summary>

```js
const memberId = 'janesmith04'
const data = {
    source: 'youtube',
    username: 'janesmith1990'
}

orbitMembers.removeIdentity(memberId, data).then(data => {
    console.log(data)
}).catch(error => {
    console.error(error)
})
```
</details>

## Contributing

We 💜 contributions from everyone! Check out the [Contributing Guidelines](.github/CONTRIBUTING.md) for more information.

## License

This is available as open source under the terms of the [MIT License](LICENSE).

## Code of Conduct

This project uses the [Contributor Code of Conduct](.github/CODE_OF_CONDUCT.md). We ask everyone to please adhere by its guidelines.
