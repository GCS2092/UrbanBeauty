export class AuthResponseDto {
  access_token: string;
  mustChangePassword?: boolean;
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

