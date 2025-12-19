import { prisma } from "./prismaClient.js";
import { User } from "../../domain/entities/User.js";
import { UserRepositoryInterface } from "../../domain/repositories/UserRepositoryInterface.js";
import { UserRole } from "../../domain/enums/UserRole.js";

export class PostgresUserRepository implements UserRepositoryInterface {
    
    async save(user: User): Promise<void> {
        await prisma.user.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password ?? "",
                role: user.role
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
            dbUser.password,
            dbUser.role as UserRole
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
            dbUser.password,
            dbUser.role as UserRole
        );
    }
    
    async findAll(): Promise<User[]> {
        const dbUsers = await prisma.user.findMany();
        return dbUsers.map((dbUser) =>
            User.create(
                dbUser.name,
                dbUser.email,
                dbUser.id,
                dbUser.password ?? undefined,
                dbUser.role as UserRole
            )
        );
    }
    
    async update(user: User): Promise<void> {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: user.name,
                email: user.email,
                password: user.password ?? undefined
            }
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id }
        });
    }

}