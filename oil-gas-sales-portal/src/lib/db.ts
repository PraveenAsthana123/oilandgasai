import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ogs_lead (
        id SERIAL PRIMARY KEY,
        company TEXT,
        contact_name TEXT,
        email TEXT,
        phone TEXT,
        stream TEXT,
        source TEXT,
        score INT DEFAULT 0,
        status TEXT DEFAULT 'new',
        owner TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogs_opportunity (
        id SERIAL PRIMARY KEY,
        lead_id INT,
        title TEXT,
        value_cad NUMERIC,
        stream TEXT,
        product TEXT,
        stage TEXT DEFAULT 'prospect',
        probability INT DEFAULT 10,
        close_date DATE,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogs_quote (
        id SERIAL PRIMARY KEY,
        opportunity_id INT,
        amount_cad NUMERIC,
        line_items JSONB,
        status TEXT DEFAULT 'draft',
        sent_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogs_contract (
        id SERIAL PRIMARY KEY,
        company TEXT,
        contract_type TEXT,
        value_cad NUMERIC,
        start_date DATE,
        end_date DATE,
        status TEXT DEFAULT 'draft',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogs_account (
        id SERIAL PRIMARY KEY,
        company TEXT,
        stream TEXT,
        revenue_cad NUMERIC DEFAULT 0,
        credit_limit_cad NUMERIC,
        payment_terms TEXT DEFAULT 'Net 30',
        health_score INT DEFAULT 50,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogs_activity (
        id SERIAL PRIMARY KEY,
        type TEXT,
        subject TEXT,
        notes TEXT,
        related_id INT,
        related_type TEXT,
        user_id TEXT,
        ts TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogs_role (
        id SERIAL PRIMARY KEY,
        name TEXT,
        permissions JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogs_audit_log (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        action TEXT,
        record_type TEXT,
        record_id TEXT,
        details JSONB,
        ts TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogs_support_ticket (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        subject TEXT,
        body TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogs_feature_flag (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        enabled BOOLEAN DEFAULT true,
        description TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
}
