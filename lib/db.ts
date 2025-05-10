import mysql from 'mysql2/promise';

// Maximum number of retries for connection attempts
const MAX_RETRIES = 5;
const RETRY_DELAY = 10000; // 10 seconds

// Create a promise-based delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create the connection pool
const createPool = () => mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT),
  waitForConnections: true,
  connectionLimit: 5, // Reduced from 10 to prevent overwhelming the server
  queueLimit: 0,
  connectTimeout: Number(process.env.MYSQL_CONNECT_TIMEOUT) || 120000, // 2 minutes
  acquireTimeout: 120000, // 2 minutes
  timeout: 120000, // 2 minutes
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000, // Increased to 30 seconds
  ssl: {
    rejectUnauthorized: false // Added to handle potential SSL issues
  }
});

let pool = createPool();

// Function to test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Function to retry the query with exponential backoff
async function retryQuery<T>(query: string, values: any[], retries = MAX_RETRIES): Promise<T> {
  try {
    const [rows] = await pool.execute(query, values);
    return rows as T;
  } catch (error: any) {
    if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED')) {
      console.warn(`Database query failed, retrying... (${retries} attempts remaining)`);
      
      // Exponential backoff
      const backoffDelay = RETRY_DELAY * (Math.pow(2, MAX_RETRIES - retries));
      await delay(backoffDelay);
      
      // Test the connection before retrying
      const isConnected = await testConnection();
      if (!isConnected) {
        // Recreate the pool if the connection test fails
        pool = createPool();
      }
      
      return retryQuery<T>(query, values, retries - 1);
    }
    throw error;
  }
}

export async function executeQuery<T>(query: string, values: any[] = []): Promise<T> {
  try {
    return await retryQuery<T>(query, values);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Export the connection pool and test function
export { pool, testConnection };