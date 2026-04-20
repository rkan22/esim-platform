generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String          @id @default(cuid())
  email        String          @unique
  passwordHash String
  role         String
  name         String
  createdAt    DateTime        @default(now())
  orders       Order[]
  tickets      SupportTicket[]
}

model Order {
  id        String   @id @default(cuid())
  plan      String
  status    String
  amount    Float
  country   String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model WalletTransaction {
  id        String   @id @default(cuid())
  type      String
  amount    Float
  status    String
  userId    String
  createdAt DateTime @default(now())
}

model SupportTicket {
  id        String   @id @default(cuid())
  message   String
  status    String   @default("Open")
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}