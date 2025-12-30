const INSTAGRAM_BASE = "https://www.instagram.com";

// Query hashes are public-facing identifiers used by Instagram's web client.
const QUERY_HASHES = {
  followers: "c76146de99bb02f6415203be841dd25a",
  following: "d04b0a864b4b54837c0d870b0e77e076",
  likers: "d5d763b1e2acf209d62d22d184488e57",
};

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

const buildPostUrl = (shortcode) => `${INSTAGRAM_BASE}/p/${shortcode}/`;

const safeFetchJson = async (url) => {
  const response = await fetch(url, { headers: DEFAULT_HEADERS });

  if (!response.ok) {
    throw new Error(`Instagram request failed with status ${response.status}`);
  }

  return response.json();
};

const fetchProfileInfo = async (username) => {
  const url = `${INSTAGRAM_BASE}/api/v1/users/web_profile_info/?username=${encodeURIComponent(
    username
  )}`;
  const data = await safeFetchJson(url);
  return data?.data?.user;
};

const fetchGraphQlEdges = async ({ queryHash, userId, first = 12 }) => {
  const variables = encodeURIComponent(
    JSON.stringify({ id: userId, include_reel: true, fetch_mutual: false, first })
  );
  const url = `${INSTAGRAM_BASE}/graphql/query/?query_hash=${queryHash}&variables=${variables}`;
  const data = await safeFetchJson(url);
  return data?.data?.user?.edge_followed_by?.edges || data?.data?.user?.edge_follow?.edges;
};

const fetchPostLikers = async ({ shortcode, first = 12 }) => {
  const variables = encodeURIComponent(JSON.stringify({ shortcode, first }));
  const url = `${INSTAGRAM_BASE}/graphql/query/?query_hash=${
    QUERY_HASHES.likers
  }&variables=${variables}`;
  const data = await safeFetchJson(url);
  return data?.data?.shortcode_media?.edge_liked_by?.edges || [];
};

const mapEdgesToUsers = (edges = []) =>
  edges.map((edge) => ({
    username: edge.node.username,
    profilePicture: edge.node.profile_pic_url,
  }));

const mapPostComments = (postEdges = []) =>
  postEdges.flatMap((edge) => {
    const post = edge.node;
    const commentEdges = post.edge_media_to_comment?.edges || [];

    return commentEdges.map((commentEdge) => ({
      postUrl: buildPostUrl(post.shortcode),
      username: commentEdge.node.owner?.username,
      text: commentEdge.node.text,
    }));
  });

const mapPostLikers = (likerEdges = [], shortcode) =>
  likerEdges.map((edge) => ({
    postUrl: buildPostUrl(shortcode),
    username: edge.node.username,
  }));

export const fetchPublicProfile = async (username) => {
  // Fetch basic profile info from Instagram's public web endpoint
  const profile = await fetchProfileInfo(username);

  if (!profile) {
    return { error: "Account not found." };
  }

  if (profile.is_private) {
    return {
      username: profile.username,
      isPrivate: true,
      message: "This account is private.",
    };
  }

  const userId = profile.id;
  const postEdges = profile.edge_owner_to_timeline_media?.edges || [];

  let followers = [];
  let following = [];
  let likes = [];

  try {
    const followerEdges = await fetchGraphQlEdges({
      queryHash: QUERY_HASHES.followers,
      userId,
    });
    followers = mapEdgesToUsers(followerEdges);
  } catch (error) {
    followers = [];
  }

  try {
    const followingEdges = await fetchGraphQlEdges({
      queryHash: QUERY_HASHES.following,
      userId,
    });
    following = mapEdgesToUsers(followingEdges);
  } catch (error) {
    following = [];
  }

  const comments = mapPostComments(postEdges);

  if (postEdges.length > 0) {
    const firstPost = postEdges[0].node;

    try {
      const likerEdges = await fetchPostLikers({ shortcode: firstPost.shortcode });
      likes = mapPostLikers(likerEdges, firstPost.shortcode);
    } catch (error) {
      likes = [];
    }
  }

  return {
    username: profile.username,
    isPrivate: false,
    profilePicture: profile.profile_pic_url_hd,
    recentFollowers: followers,
    recentFollowing: following,
    recentLikes: likes,
    recentComments: comments,
    fetchedAt: new Date().toISOString(),
  };
};
