import { NextResponse } from "next/server";
import { executeQuery, testConnection } from "@/lib/db";

interface User {
  id: number;
  username: string;
  // Add other fields as needed
}

export async function GET() {
  try {
    // First test the connection
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, message: "Database connection failed" },
        { status: 500 }
      );
    }

    // If connected, try to fetch a user
    const users = await executeQuery<User[]>(
      "SELECT * FROM ipr_user LIMIT 1"
    );

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      data: users
    });

  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { success: false, message: "Error testing database connection", error },
      { status: 500 }
    );
  }
}