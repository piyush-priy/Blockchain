import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: "postgresql://postgres:FraZ@123$@localhost:5432/ticket-app?schema=public",
                },
            },
        });
    }
}
