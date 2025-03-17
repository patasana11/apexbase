export class GSBError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'GSBError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
} 