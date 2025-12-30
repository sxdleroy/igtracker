# IG Tracker

Simple Instagram public activity checker (no login required). It fetches public-facing data and presents recent followers, following, likes, and comments in a minimal UI.

## Features

- Clean, minimal UI
- Public Instagram username search
- Recent followers and following (publicly accessible)
- Recent likes and comments (publicly accessible)
- Private account handling
- Loading state and basic error handling

## Project structure

```
public/               # Frontend assets
server/               # Express backend
server/services/      # Isolated data fetching logic
```

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open the app:

   ```
   http://localhost:3000
   ```

## Example response format

```json
{
  "username": "natgeo",
  "isPrivate": false,
  "profilePicture": "https://...",
  "recentFollowers": [
    { "username": "example_follower", "profilePicture": "https://..." }
  ],
  "recentFollowing": [
    { "username": "example_following", "profilePicture": "https://..." }
  ],
  "recentLikes": [
    { "postUrl": "https://www.instagram.com/p/ABC123/", "username": "liker" }
  ],
  "recentComments": [
    {
      "postUrl": "https://www.instagram.com/p/ABC123/",
      "username": "commenter",
      "text": "Great shot!"
    }
  ],
  "fetchedAt": "2024-12-27T20:00:00.000Z"
}
```

## Notes

- This project uses Instagram's public web endpoints and may be subject to rate limits or changes.
- Some data (followers, following, likes) may be limited depending on Instagram's public availability.
