    import { PrismaClient } from "@prisma/client";
    import bcrypt from "bcrypt";
    import { NextResponse } from "next/server";

    const prisma = new PrismaClient();

    export async function POST(request: Request) {
      try {
        const { email, password } = await request.json();

        // 基本的なバリデーション
        if (!email || !password) {
          return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 }
          );
        }

        // もしユーザーが既に存在する場合はエラーを返す
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "User with this email already exists" },
            { status: 409 } // 409 コンフリクト
          );
        }

        // パスワードをハッシュ化してから保存
        const hashedPassword = await bcrypt.hash(password, 10);

        // 新しいユーザーを作成
        await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
          },
        });

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });

      } catch (error) {
        console.error("Signup Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
    }
    
