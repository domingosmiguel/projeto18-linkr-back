import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

let connection;

try {
  connection = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
  await connection.connect();
  console.log('Connected to PostgreSQL');
} catch (error) {
  console.log(error);
}

export default connection;
