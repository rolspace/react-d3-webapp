export interface GitHubUser {
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  websiteUrl: string | null;
  twitterUsername: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubUserResponse {
  viewer: GitHubUser;
}
