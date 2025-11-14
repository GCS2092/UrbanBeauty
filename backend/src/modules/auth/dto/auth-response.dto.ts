export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

