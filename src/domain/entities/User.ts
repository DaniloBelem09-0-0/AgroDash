import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../enums/UserRole.js';

export class User {
    private _id!: string;
    private _name!: string;
    private _email!: string;
    private _password: string | null | undefined = null;
    private _role: UserRole;

    private constructor(name: string, email: string, id?: string, password?: string, role?: UserRole) {
        this._name = name;
        this._email = email;
        this._id = id || uuidv4();
        this._password = password;
        this._role = role || UserRole.CONSUMER;

        this.validate();
    }

    public static create(name: string, email: string, id?: string, password?: string, role?: UserRole): User {
        return new User(name, email, id, password, role);
    }

    get id(): string { return this._id; }
    get name(): string { return this._name; }
    get email(): string { return this._email; }
    get password(): string | null | undefined { return this._password; }
    get role(): UserRole { return this._role; }
    
    public changeName(newName: string) {
        if (newName.length < 2) {
        throw new Error("Nome muito curto.");
        }
        this._name = newName;
    }

    public changeEmail(newEmail: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
        throw new Error("Email inválido.");
        }
        this._email = newEmail;
    }

    public changePassword(newPassword: string) {
        if (newPassword.length < 6) {
        throw new Error("Senha muito curta.");
        }
        this._password = newPassword;
    }
    
    private validate() {
        if (this._name.length < 2) {
        throw new Error("Nome muito curto.");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this._email)) {
        throw new Error("Email inválido.");
        }
        if (this._password && this._password.length < 6) {
        throw new Error("Senha muito curta.");
        }
    }
}