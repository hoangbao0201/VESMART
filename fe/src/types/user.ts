export type UserRole = "ADMIN" | "MODERATOR" | "USER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export type AuthUser = {
  id: number;
  email: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
};

/** Public profile - email may be omitted. */
export type UserProfile = Omit<AuthUser, "email"> & {
  email?: string;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type AuthLoginResult = AuthTokens & {
  user: AuthUser;
};

export type AuthRegisterResult = AuthLoginResult;
