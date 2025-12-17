import { prisma } from "./prismaClient.js";
import { User } from "../../domain/entities/User.js";
import { UserRepositoryInterface } from "../../domain/repositories/UserRepositoryInterface.js";

export class PostgresUserRepository implements UserRepositoryInterface {
    
    async save(user: User): Promise<void> {
        await prisma.user.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password 
            }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        const dbUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!dbUser) return null;

        return User.create(
            dbUser.name,
            dbUser.email,
            dbUser.id,
            dbUser.password
        );
    }

    async findById(id: string): Promise<User | null> {
        const dbUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!dbUser) return null;

        return User.create(
            dbUser.name,
            dbUser.email,
            dbUser.id,
            dbUser.password
        );
    }
    
    async findAll(): Promise<User[]> {
        const dbUsers = await prisma.user.findMany();
        return dbUsers.map((dbUser: User) => 
            User.create(
                dbUser.name,
                dbUser.email,
                dbUser.id,
                dbUser.password!
            )
        );
    }
    
    async update(user: User): Promise<void> {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: user.name,
                email: user.email,
                password: user.password
            }
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id }
        });
    }

}

/**
 * save(user: import("../entities/User.js").User): Promise<void>;
 * findById(id: string): Promise<import("../entities/User.js").User | null>;
 * findByEmail(email: string): Promise<import("../entities/User.js").User | null>;
 * findAll(): Promise<import("../entities/User.js").User[]>;
 * update(user: import("../entities/User.js").User): Promise<void>;
 * delete(id: string): Promise<void>;
 */
    