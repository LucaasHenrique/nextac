export interface RegisterBody {
    username: string;
    email: string;
    password: string;
    university: string;
    major: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface JwtPayload {
    id: string;
    email: string;
}

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
}
