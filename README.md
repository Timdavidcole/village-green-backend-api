# village-green-backend-api

Welcome to the backend API for Village Green.  The Noticeboard App.  This was built using Node.js and Express, and currently hosted on Heroku, although I'm looking to get it up on AWS asap.  There are some google maps API calls in there so please don't spam user creation!

URL Root: `https://village-green-backend-api.herokuapp.com`

Many thanks to the [Thinkster walkthrough](https://thinkster.io/tutorials/node-json-api), which I used significantly in the creation of this API.  

## Considerations for your backend with [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)

If the backend is about to run on a different host/port than the frontend, make sure to handle `OPTIONS` too and return correct `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers` (e.g. `Content-Type`).

### Authentication Header:

`Authorization: Token jwt.token.here`

## JSON Objects returned by API:

Make sure the right content type like `Content-Type: application/json; charset=utf-8` is correctly returned.

### Users (for authentication)

```JSON
{
    "user": {
        "username": "readme",
        "email": "readme@readme.readme",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkOGJhZjlhMjA3M2U4MDAyNDBhMGM4MyIsInVzZXJuYW1lIjoicmVhZG1lIiwiZXhwIjoxNTc0NjE5NTQ2LCJpYXQiOjE1Njk0MzU1NDZ9.muur17oO-kMBUq_LvOlSi1LQ4lLHJ2sVtYEEe9nyg38",
        "address": "Buckingham Place, London",
        "homeXCoord": 51.4989618,
        "homeYCoord": -0.140317,
        "id": "5d8baf9a2073e800240a0c83"
    }
}
```

### Profile

```JSON
{
    "profile": {
        "username": "readme",
        "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
        "address": "Buckingham Place, London",
        "homeXCoord": 51.4989618,
        "homeYCoord": -0.140317,
        "id": "5d8baf9a2073e800240a0c83",
        "following": false
    }
}
```

### Single Notice

```JSON
{
    "notice": {
        "slug": "how-to-write-a-readme-jz92lk",
        "title": "How to write a readme",
        "description": "Job Request",
        "body": "Could anyone help me with writing a readme?",
        "comments": [],
        "favoritesCount": 0,
        "upVotesCount": 0,
        "downVotesCount": 0,
        "createdAt": "2019-09-25T18:34:30.156Z",
        "updatedAt": "2019-09-25T18:34:30.156Z",
        "tagList": [
            "readme",
            "help"
        ],
        "author": {
            "username": "readme",
            "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
            "address": "Buckingham Place, London",
            "homeXCoord": 51.4989618,
            "homeYCoord": -0.140317,
            "id": "5d8baf9a2073e800240a0c83",
            "following": false
        },
        "isFavorite": false,
        "isUpVoted": false,
        "isDownVoted": false,
        "id": "5d8bb3362073e800240a0c84"
    }
}
```

### Multiple Articles

```JSON
{
    "notices": [
        {
            "slug": "notice-test-od43rg",
            "title": "Notice test",
            "description": "A test post",
            "body": "Hey, we all love a good test.",
            "comments": [],
            "favoritesCount": 0,
            "upVotesCount": 0,
            "downVotesCount": 0,
            "createdAt": "2019-09-25T18:35:33.421Z",
            "updatedAt": "2019-09-25T18:35:33.421Z",
            "tagList": [
                "test",
                "notice"
            ],
            "author": {
                "username": "readme",
                "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
                "address": "Buckingham Place, London",
                "homeXCoord": 51.4989618,
                "homeYCoord": -0.140317,
                "id": "5d8baf9a2073e800240a0c83",
                "following": false
            },
            "isFavorite": false,
            "isUpVoted": false,
            "isDownVoted": false,
            "id": "5d8bb3752073e800240a0c85"
        },
        {
            "slug": "how-to-write-a-readme-jz92lk",
            "title": "How to write a readme",
            "description": "Job Request",
            "body": "Could anyone help me with writing a readme?",
            "comments": [],
            "favoritesCount": 0,
            "upVotesCount": 0,
            "downVotesCount": 0,
            "createdAt": "2019-09-25T18:34:30.156Z",
            "updatedAt": "2019-09-25T18:34:30.156Z",
            "tagList": [
                "readme",
                "help"
            ],
            "author": {
                "username": "readme",
                "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
                "address": "Buckingham Place, London",
                "homeXCoord": 51.4989618,
                "homeYCoord": -0.140317,
                "id": "5d8baf9a2073e800240a0c83",
                "following": false
            },
            "isFavorite": false,
            "isUpVoted": false,
            "isDownVoted": false,
            "id": "5d8bb3362073e800240a0c84"
        }
    ],
    "noticesCount": 2
}
```

### Single Comment

```JSON
{
    "comment": {
        "id": "5d8bb5e5118ce10024853d8b",
        "body": "Commenting on your own posts is best.",
        "createdAt": "2019-09-25T18:45:57.215Z",
        "author": {
            "username": "readme",
            "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
            "address": "Buckingham Place, London",
            "homeXCoord": 51.4989618,
            "homeYCoord": -0.140317,
            "id": "5d8baf9a2073e800240a0c83",
            "following": false
        }
    }
}
```

### Multiple Comments

```JSON
{
    "comments": [
        {
            "id": "5d8bb60a118ce10024853d8d",
            "body": "And one more for good luck",
            "createdAt": "2019-09-25T18:46:34.456Z",
            "author": {
                "username": "readme",
                "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
                "address": "Buckingham Place, London",
                "homeXCoord": 51.4989618,
                "homeYCoord": -0.140317,
                "id": "5d8baf9a2073e800240a0c83",
                "following": false
            }
        },
        {
            "id": "5d8bb5e5118ce10024853d8b",
            "body": "Commenting on your own posts is best.",
            "createdAt": "2019-09-25T18:45:57.215Z",
            "author": {
                "username": "readme",
                "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
                "address": "Buckingham Place, London",
                "homeXCoord": 51.4989618,
                "homeYCoord": -0.140317,
                "id": "5d8baf9a2073e800240a0c83",
                "following": false
            }
        }
    ]
}
```

### List of Tags

```JSON
{
  "tags": [
    "job",
    "readme"
  ]
}
```

### Errors and Status Codes

If a request fails any validations, expect a 422 and errors in the following format:

```JSON
{
  "errors":{
    "body": [
      "can't be empty"
    ]
  }
}
```

#### Other status codes:

401 for Unauthorized requests, when a request requires authentication but it isn't provided

403 for Forbidden requests, when a request may be valid but the user doesn't have permissions to perform the action

404 for Not found requests, when a resource can't be found to fulfill the request


## Endpoints:

### Authentication:

`POST /api/users/login`

Example request body:
```JSON
{
  "user":{
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```

No authentication required, returns a [User](#users-for-authentication)

Required fields: `email`, `password`


### Registration:

`POST /api/users`

Example request body:
```JSON
{
  "user":{
    "username": "readme",
    "email": "readme@readme.readme",
    "password": "123456",
    "address": "Buckingham Place, London"
  }
}
```

No authentication required, returns a [User](#users-for-authentication)

Required fields: `email`, `username`, `password`



### Get Current User

`GET /api/user`

Authentication required, returns a [User](#users-for-authentication) that's the current user


### Update User

`PUT /api/user`

Example request body:
```JSON
{
  "user":{
    "email": "readme1@readme1.readme1",
    "bio": "another readme",
    "image": "https://image.jpg",
    "address": "10 Downing Street, London"
  }
}
```

Authentication required, returns the [User](#users-for-authentication)

Accepted fields: `email`, `username`, `password`, `image`, `bio`
Only field that requires updating required.



### Get Profile

`GET /api/profiles/:username`

Authentication optional, returns a [Profile](#profile)



### Follow user

`POST /api/profiles/:username/follow`

Authentication required, returns a [Profile](#profile)

No additional parameters required



### Unfollow user

`DELETE /api/profiles/:username/follow`

Authentication required, returns a [Profile](#profile)

No additional parameters required



### List Notices

`GET /api/notices`

Returns most recent notices globally by default, provide `tag`, `author` or `favorited` query parameter to filter results

Query Parameters:

Filter by tag:

`?tag=readme`

Filter by author:

`?author=jake`

Favorited by user:

`?favorited=jake`

Limit number of articles (default is 20):

`?limit=20`

Offset/skip number of articles (default is 0):

`?offset=0`

Authentication optional, will return [multiple articles](#multiple-articles), ordered by most recent first



### Feed Notices

`GET /api/notices/feed`

Can also take `limit` and `offset` query parameters like [List Articles](#list-articles)

Authentication required, will return [multiple articles](#multiple-articles) created by followed users, ordered by most recent first.

*Currently only gives most recent, will update to show only local.


### Get Article

`GET /api/articles/:slug`

No authentication required, will return [single article](#single-article)

### Create Article

`POST /api/articles`

Example request body:

```JSON
{
  "article": {
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "You have to believe",
    "tagList": ["reactjs", "angularjs", "dragons"]
  }
}
```

Authentication required, will return an [Article](#single-article)

Required fields: `title`, `description`, `body`

Optional fields: `tagList` as an array of Strings



### Update Article

`PUT /api/articles/:slug`

Example request body:

```JSON
{
  "article": {
    "title": "Did you train your dragon?"
  }
}
```

Authentication required, returns the updated [Article](#single-article)

Optional fields: `title`, `description`, `body`

The `slug` also gets updated when the `title` is changed


### Delete Article

`DELETE /api/articles/:slug`

Authentication required



### Add Comments to a Notice

`POST /api/notices/:slug/comments`

Example request body:

```JSON
{
  "comment": {
    "body": "His name was my name too."
  }
}
```

Authentication required, returns the created [Comment](#single-comment)

Required field: `body`



### Get Comments from a Notice

`GET /api/notices/:slug/comments`

Authentication optional, returns [multiple comments](#multiple-comments)



### Delete Comment

`DELETE /api/notices/:slug/comments/:id`

Authentication required



### Favorite Notice

`POST /api/notices/:slug/favorite`

Authentication required, returns the [Notice](#single-article)

No additional parameters required



### Unfavorite Notice

`DELETE /api/notices/:slug/favorite`

Authentication required, returns the [Notice](#single-article)

No additional parameters required


### Upvote Notice

`POST /api/notices/:slug/upvote`

Authentication required, returns the [Notice](#single-article)

No additional parameters required



### Unupvote Notice

`DELETE /api/notices/:slug/upvote`

Authentication required, returns the [Notice](#single-article)

No additional parameters required


### Downvote Notice

`POST /api/notices/:slug/downvote`

Authentication required, returns the [Notice](#single-article)

No additional parameters required



### Undownvote Notice

`DELETE /api/notices/:slug/downvote`

Authentication required, returns the [Notice](#single-article)

No additional parameters required



### Get Tags

`GET /api/tags`

No authentication required, returns a [List of Tags](#list-of-tags)
