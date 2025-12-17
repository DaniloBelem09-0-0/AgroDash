export interface UserRepositoryInterface {
    save(user: import("../entities/User.js").User): Promise<void>;
    findById(id: string): Promise<import("../entities/User.js").User | null>;
    findByEmail(email: string): Promise<import("../entities/User.js").User | null>;
    findAll(): Promise<import("../entities/User.js").User[]>;
    update(user: import("../entities/User.js").User): Promise<void>;
    delete(id: string): Promise<void>;
}
