export class Auth {
    constructor(
        public readonly userId: string,
        public readonly token: string,
        public readonly expiresAt: Date
    ) {}
}