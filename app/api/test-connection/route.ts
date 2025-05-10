import { NextResponse } from "next/server";
import { executeQuery, testConnection } from "@/lib/db";

interface User {
  id: number;
  username: string;
}

export async function GET() {
  try {
    console.log('Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('Database connection test failed in route handler');
      return NextResponse.json(
        { 
          success: false, 
          message: "Database connection failed. Please check server connectivity and configuration.",
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    console.log('Connection test successful, attempting to fetch user data');
    const users = await executeQuery<User[]>(
      "SELECT * FROM ipr_user LIMIT 1"
    );

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      timestamp: new Date().toISOString(),
      data: users
    });

  } catch (error: any) {
    console.error('Database test error in route handler:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Error testing database connection",
        error: {
          message: error.message,
          code: error.code
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}