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
  connectionLimit: 3, // Reduced to prevent overwhelming the server
  queueLimit: 0,
  connectTimeout: 300000, // Increased to 5 minutes
  acquireTimeout: 300000, // Increased to 5 minutes
  timeout: 300000, // Increased to 5 minutes
  enableKeepAlive: true,
  keepAliveInitialDelay: 60000, // Increased to 1 minute
  ssl: {
    rejectUnauthorized: false
  }
});

let pool = createPool();

// Enhanced connection test function with detailed error logging
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully acquired database connection');
    
    await connection.ping();
    console.log('Successfully pinged database server');
    
    connection.release();
    console.log('Successfully released database connection');
    
    return true;
  } catch (error: any) {
    console.error('Database connection test failed with details:', {
      errorCode: error.code,
      errorNumber: error.errno,
      errorMessage: error.message,
      errorSyscall: error.syscall,
      fatal: error.fatal
    });
    return false;
  }
}

// Function to retry the query with exponential backoff
async function retryQuery<T>(query: string, values: any[], retries = MAX_RETRIES): Promise<T> {
  try {
    console.log(`Executing query with ${retries} retries remaining`);
    const [rows] = await pool.execute(query, values);
    console.log('Query executed successfully');
    return rows as T;
  } catch (error: any) {
    if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED')) {
      console.warn(`Database query failed with error code ${error.code}, retrying... (${retries} attempts remaining)`);
      
      // Exponential backoff
      const backoffDelay = RETRY_DELAY * (Math.pow(2, MAX_RETRIES - retries));
      console.log(`Waiting ${backoffDelay}ms before retrying`);
      await delay(backoffDelay);
      
      // Test the connection before retrying
      const isConnected = await testConnection();
      if (!isConnected) {
        console.log('Connection test failed, recreating connection pool');
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