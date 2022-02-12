export type AppUser = {
  email: string;
  password: string;
};

export type JWT = {
  sub: string;
  exp: number;
};

export enum Cookie {
  AccessToken = 'accessToken',
  RefreshToken = 'refreshToken',
}
