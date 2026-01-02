import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Zap, Lock, Users, Shield, Table } from "lucide-react";
import CodeBlock from "./CodeBlock";

const plsqlPackageCode = `CREATE OR REPLACE PACKAGE BODY order_processing_pkg AS

  -- Private constants
  c_status_pending    CONSTANT VARCHAR2(20) := 'PENDING';
  c_status_approved   CONSTANT VARCHAR2(20) := 'APPROVED';
  c_status_rejected   CONSTANT VARCHAR2(20) := 'REJECTED';

  -- Process order with full error handling
  PROCEDURE process_order(
    p_order_id    IN  orders.order_id%TYPE,
    p_result      OUT VARCHAR2,
    p_error_msg   OUT VARCHAR2
  ) IS
    v_order_amount  NUMBER;
    v_customer_id   customers.customer_id%TYPE;
    v_credit_limit  NUMBER;
    
    e_insufficient_credit EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_insufficient_credit, -20001);
  BEGIN
    -- Set savepoint for rollback
    SAVEPOINT sp_process_order;
    
    -- Lock order row for update
    SELECT order_amount, customer_id
    INTO   v_order_amount, v_customer_id
    FROM   orders
    WHERE  order_id = p_order_id
    FOR UPDATE NOWAIT;
    
    -- Check customer credit limit
    SELECT credit_limit
    INTO   v_credit_limit
    FROM   customers
    WHERE  customer_id = v_customer_id;
    
    IF v_order_amount > v_credit_limit THEN
      RAISE e_insufficient_credit;
    END IF;
    
    -- Update order status
    UPDATE orders
    SET    status = c_status_approved,
           processed_date = SYSTIMESTAMP,
           processed_by = SYS_CONTEXT('USERENV', 'SESSION_USER')
    WHERE  order_id = p_order_id;
    
    -- Update customer credit
    UPDATE customers
    SET    credit_limit = credit_limit - v_order_amount,
           last_order_date = SYSDATE
    WHERE  customer_id = v_customer_id;
    
    -- Log the transaction
    INSERT INTO order_audit_log (
      log_id, order_id, action, action_date, details
    ) VALUES (
      order_audit_seq.NEXTVAL,
      p_order_id,
      'APPROVED',
      SYSTIMESTAMP,
      'Order processed successfully. Amount: ' || v_order_amount
    );
    
    COMMIT;
    p_result := 'SUCCESS';
    
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      ROLLBACK TO sp_process_order;
      p_result := 'ERROR';
      p_error_msg := 'Order not found: ' || p_order_id;
      log_error(p_order_id, SQLERRM);
      
    WHEN e_insufficient_credit THEN
      ROLLBACK TO sp_process_order;
      UPDATE orders SET status = c_status_rejected WHERE order_id = p_order_id;
      COMMIT;
      p_result := 'REJECTED';
      p_error_msg := 'Insufficient credit limit';
      
    WHEN OTHERS THEN
      ROLLBACK TO sp_process_order;
      p_result := 'ERROR';
      p_error_msg := SQLERRM;
      log_error(p_order_id, SQLERRM || CHR(10) || DBMS_UTILITY.FORMAT_ERROR_BACKTRACE);
  END process_order;

  -- Bulk processing with collections
  PROCEDURE process_orders_bulk(
    p_order_ids   IN  t_order_id_table,
    p_results     OUT t_result_table
  ) IS
    TYPE t_orders_rec IS RECORD (
      order_id      orders.order_id%TYPE,
      order_amount  orders.order_amount%TYPE,
      customer_id   customers.customer_id%TYPE
    );
    TYPE t_orders_tab IS TABLE OF t_orders_rec;
    v_orders t_orders_tab;
  BEGIN
    -- Bulk collect orders
    SELECT order_id, order_amount, customer_id
    BULK COLLECT INTO v_orders
    FROM   orders
    WHERE  order_id IN (SELECT COLUMN_VALUE FROM TABLE(p_order_ids))
    AND    status = c_status_pending;
    
    -- Process each order
    FOR i IN 1..v_orders.COUNT LOOP
      DECLARE
        v_result    VARCHAR2(20);
        v_error_msg VARCHAR2(4000);
      BEGIN
        process_order(v_orders(i).order_id, v_result, v_error_msg);
        p_results(i) := t_result_rec(v_orders(i).order_id, v_result, v_error_msg);
      END;
    END LOOP;
  END process_orders_bulk;

END order_processing_pkg;
/`;

const postgresqlFunctionCode = `-- Create order processing function with proper error handling
CREATE OR REPLACE FUNCTION process_order(
    p_order_id UUID,
    OUT p_result VARCHAR(20),
    OUT p_error_msg TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_amount DECIMAL(15,2);
    v_customer_id UUID;
    v_credit_limit DECIMAL(15,2);
BEGIN
    -- Lock and fetch order
    SELECT order_amount, customer_id
    INTO STRICT v_order_amount, v_customer_id
    FROM orders
    WHERE order_id = p_order_id
    FOR UPDATE;

    -- Check credit limit
    SELECT credit_limit
    INTO STRICT v_credit_limit
    FROM customers
    WHERE customer_id = v_customer_id;

    IF v_order_amount > v_credit_limit THEN
        -- Reject order
        UPDATE orders 
        SET status = 'REJECTED',
            updated_at = NOW()
        WHERE order_id = p_order_id;
        
        p_result := 'REJECTED';
        p_error_msg := 'Insufficient credit limit';
        RETURN;
    END IF;

    -- Approve order
    UPDATE orders
    SET status = 'APPROVED',
        processed_date = NOW(),
        updated_at = NOW()
    WHERE order_id = p_order_id;

    -- Update customer credit
    UPDATE customers
    SET credit_limit = credit_limit - v_order_amount,
        last_order_date = NOW(),
        updated_at = NOW()
    WHERE customer_id = v_customer_id;

    -- Audit log
    INSERT INTO order_audit_log (order_id, action, details, created_at)
    VALUES (p_order_id, 'APPROVED', 
            jsonb_build_object('amount', v_order_amount, 'customer', v_customer_id),
            NOW());

    p_result := 'SUCCESS';
    p_error_msg := NULL;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := 'ERROR';
        p_error_msg := 'Order or customer not found';
    WHEN OTHERS THEN
        p_result := 'ERROR';
        p_error_msg := SQLERRM;
        -- Log error
        RAISE WARNING 'Error processing order %: %', p_order_id, SQLERRM;
END;
$$;

-- Partitioned orders table for performance
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id),
    order_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE orders_2024_01 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_2024_02 PARTITION OF orders
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Indexes for performance
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status) WHERE status = 'PENDING';
CREATE INDEX idx_orders_created ON orders(created_at DESC);`;

const oracleAdvancedCode = `-- Advanced Oracle PL/SQL Patterns

-- Pipelined Table Function for large datasets
CREATE OR REPLACE FUNCTION get_order_report(
    p_start_date DATE,
    p_end_date   DATE
) RETURN order_report_table PIPELINED
PARALLEL_ENABLE (PARTITION p_orders BY RANGE(order_date))
IS
    CURSOR c_orders IS
        SELECT /*+ PARALLEL(o, 4) */
               o.order_id,
               o.order_date,
               o.order_amount,
               c.customer_name,
               SUM(oi.quantity * oi.unit_price) AS total_value
        FROM   orders o
        JOIN   customers c ON o.customer_id = c.customer_id
        JOIN   order_items oi ON o.order_id = oi.order_id
        WHERE  o.order_date BETWEEN p_start_date AND p_end_date
        GROUP BY o.order_id, o.order_date, o.order_amount, c.customer_name;
BEGIN
    FOR r_order IN c_orders LOOP
        PIPE ROW (order_report_rec(
            r_order.order_id,
            r_order.order_date,
            r_order.order_amount,
            r_order.customer_name,
            r_order.total_value
        ));
    END LOOP;
    RETURN;
END;
/

-- Using the pipelined function
SELECT * FROM TABLE(get_order_report(DATE '2024-01-01', DATE '2024-12-31'))
WHERE total_value > 10000
ORDER BY order_date DESC;

-- Compound Trigger for audit and validation
CREATE OR REPLACE TRIGGER orders_compound_trigger
FOR INSERT OR UPDATE OR DELETE ON orders
COMPOUND TRIGGER

    TYPE t_order_changes IS TABLE OF orders%ROWTYPE INDEX BY PLS_INTEGER;
    g_changes t_order_changes;
    g_index   PLS_INTEGER := 0;

    BEFORE EACH ROW IS
    BEGIN
        IF INSERTING OR UPDATING THEN
            :NEW.updated_at := SYSTIMESTAMP;
            :NEW.updated_by := SYS_CONTEXT('USERENV', 'SESSION_USER');
        END IF;
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        g_index := g_index + 1;
        IF DELETING THEN
            g_changes(g_index) := :OLD;
        ELSE
            g_changes(g_index) := :NEW;
        END IF;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
    BEGIN
        -- Bulk insert audit records
        FORALL i IN 1..g_changes.COUNT
            INSERT INTO orders_audit (
                audit_id, order_id, action, action_date, old_status, new_status
            ) VALUES (
                orders_audit_seq.NEXTVAL,
                g_changes(i).order_id,
                CASE WHEN INSERTING THEN 'INSERT'
                     WHEN UPDATING THEN 'UPDATE'
                     ELSE 'DELETE' END,
                SYSTIMESTAMP,
                NULL,
                g_changes(i).status
            );
        g_changes.DELETE;
        g_index := 0;
    END AFTER STATEMENT;

END orders_compound_trigger;
/

-- Result Cache for frequently accessed data
CREATE OR REPLACE FUNCTION get_customer_stats(
    p_customer_id customers.customer_id%TYPE
) RETURN customer_stats_rec
RESULT_CACHE RELIES_ON (orders, customers)
IS
    v_stats customer_stats_rec;
BEGIN
    SELECT customer_stats_rec(
               c.customer_id,
               c.customer_name,
               COUNT(o.order_id),
               NVL(SUM(o.order_amount), 0),
               MAX(o.order_date)
           )
    INTO   v_stats
    FROM   customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    WHERE  c.customer_id = p_customer_id
    GROUP BY c.customer_id, c.customer_name;
    
    RETURN v_stats;
END;
/`;

const postgresAdvancedCode = `-- Advanced PostgreSQL Patterns

-- Recursive CTE for hierarchical data
WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT 
        category_id,
        category_name,
        parent_id,
        1 as level,
        category_name::TEXT as path,
        ARRAY[category_id] as path_ids
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case
    SELECT 
        c.category_id,
        c.category_name,
        c.parent_id,
        ct.level + 1,
        ct.path || ' > ' || c.category_name,
        ct.path_ids || c.category_id
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.category_id
)
SELECT * FROM category_tree ORDER BY path;

-- Window functions for analytics
SELECT 
    order_id,
    customer_id,
    order_amount,
    order_date,
    -- Running total per customer
    SUM(order_amount) OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as running_total,
    -- Rank within customer
    RANK() OVER (
        PARTITION BY customer_id 
        ORDER BY order_amount DESC
    ) as amount_rank,
    -- Difference from previous order
    order_amount - LAG(order_amount, 1, 0) OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
    ) as amount_change,
    -- Moving average (last 3 orders)
    AVG(order_amount) OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) as moving_avg_3
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '1 year';

-- JSONB operations for flexible schema
CREATE TABLE order_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query nested JSONB data
SELECT 
    order_id,
    event_type,
    event_data->>'status' as status,
    event_data->'metadata'->>'source' as source,
    (event_data->>'amount')::DECIMAL as amount,
    event_data->'items' as items,
    jsonb_array_length(event_data->'items') as item_count
FROM order_events
WHERE event_data @> '{"priority": "high"}'
  AND event_data ? 'metadata'
  AND (event_data->>'amount')::DECIMAL > 1000;

-- GIN index for JSONB
CREATE INDEX idx_order_events_data ON order_events USING GIN (event_data);

-- Full-text search
ALTER TABLE products ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION products_search_trigger() 
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION products_search_trigger();

CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Search with ranking
SELECT 
    product_id,
    name,
    description,
    ts_rank(search_vector, query) as rank
FROM products, plainto_tsquery('english', 'wireless bluetooth') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;`;

// User Administration - Oracle
const oracleUserAdminCode = `-- ============================================
-- Oracle User & Security Administration
-- ============================================

-- Create tablespaces for data organization
CREATE TABLESPACE app_data
  DATAFILE '/u01/oradata/ORCL/app_data01.dbf'
  SIZE 1G
  AUTOEXTEND ON NEXT 100M
  MAXSIZE 10G;

CREATE TABLESPACE app_index
  DATAFILE '/u01/oradata/ORCL/app_index01.dbf'
  SIZE 500M
  AUTOEXTEND ON NEXT 50M
  MAXSIZE 5G;

-- Create application schema user
CREATE USER app_schema
  IDENTIFIED BY "SecurePassword123!"
  DEFAULT TABLESPACE app_data
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON app_data
  QUOTA UNLIMITED ON app_index
  PROFILE app_profile;

-- Create read-only user for reporting
CREATE USER app_readonly
  IDENTIFIED BY "ReadOnlyPass123!"
  DEFAULT TABLESPACE app_data
  TEMPORARY TABLESPACE temp
  QUOTA 0 ON app_data
  PROFILE readonly_profile;

-- Create application role
CREATE ROLE app_user_role;
CREATE ROLE app_admin_role;
CREATE ROLE app_readonly_role;

-- Grant system privileges to roles
GRANT CREATE SESSION TO app_user_role;
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, 
      CREATE PROCEDURE, CREATE SEQUENCE, CREATE TRIGGER
TO app_admin_role;

-- Grant object privileges
GRANT SELECT ON app_schema.orders TO app_readonly_role;
GRANT SELECT ON app_schema.customers TO app_readonly_role;
GRANT SELECT ON app_schema.order_items TO app_readonly_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON app_schema.orders TO app_user_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON app_schema.customers TO app_user_role;
GRANT EXECUTE ON app_schema.order_processing_pkg TO app_user_role;

-- Assign roles to users
GRANT app_admin_role TO app_schema;
GRANT app_readonly_role TO app_readonly;
GRANT app_user_role TO app_api_user;

-- Create password profile for security
CREATE PROFILE app_profile LIMIT
  FAILED_LOGIN_ATTEMPTS 5
  PASSWORD_LOCK_TIME 1/24  -- 1 hour
  PASSWORD_LIFE_TIME 90
  PASSWORD_REUSE_TIME 365
  PASSWORD_REUSE_MAX 12
  PASSWORD_GRACE_TIME 7;

-- Create audit policy
CREATE AUDIT POLICY order_audit_policy
  ACTIONS 
    INSERT ON app_schema.orders,
    UPDATE ON app_schema.orders,
    DELETE ON app_schema.orders
  WHEN 'SYS_CONTEXT(''USERENV'', ''SESSION_USER'') != ''APP_SCHEMA'''
  EVALUATE PER SESSION;

AUDIT POLICY order_audit_policy;

-- Virtual Private Database (VPD) for row-level security
CREATE OR REPLACE FUNCTION order_security_policy(
  p_schema  IN VARCHAR2,
  p_object  IN VARCHAR2
) RETURN VARCHAR2 IS
  v_predicate VARCHAR2(4000);
BEGIN
  -- Admin sees everything
  IF SYS_CONTEXT('APP_CTX', 'USER_ROLE') = 'ADMIN' THEN
    RETURN NULL;
  END IF;
  
  -- Regular users see only their department's orders
  v_predicate := 'department_id = SYS_CONTEXT(''APP_CTX'', ''DEPARTMENT_ID'')';
  RETURN v_predicate;
END;
/

BEGIN
  DBMS_RLS.ADD_POLICY(
    object_schema   => 'APP_SCHEMA',
    object_name     => 'ORDERS',
    policy_name     => 'ORDER_ACCESS_POLICY',
    function_schema => 'APP_SCHEMA',
    policy_function => 'ORDER_SECURITY_POLICY',
    statement_types => 'SELECT, INSERT, UPDATE, DELETE'
  );
END;
/`;

// User Administration - PostgreSQL
const postgresUserAdminCode = `-- ============================================
-- PostgreSQL User & Security Administration
-- ============================================

-- Create roles hierarchy
CREATE ROLE app_readonly;
CREATE ROLE app_user;
CREATE ROLE app_admin;

-- Create login users
CREATE USER api_service WITH 
  LOGIN 
  PASSWORD 'SecurePassword123!'
  CONNECTION LIMIT 100
  IN ROLE app_user;

CREATE USER readonly_user WITH
  LOGIN
  PASSWORD 'ReadOnlyPass123!'
  CONNECTION LIMIT 50
  IN ROLE app_readonly;

CREATE USER admin_user WITH
  LOGIN
  PASSWORD 'AdminPass123!'
  SUPERUSER
  IN ROLE app_admin;

-- Create schema for application
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION admin_user;

-- Grant schema permissions
GRANT USAGE ON SCHEMA app TO app_readonly, app_user, app_admin;

-- Readonly role permissions
GRANT SELECT ON ALL TABLES IN SCHEMA app TO app_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT SELECT ON TABLES TO app_readonly;

-- User role permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- Admin role permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA app TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA app TO app_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA app TO app_admin;

-- Row Level Security (RLS)
ALTER TABLE app.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their department's data
CREATE POLICY department_isolation_orders ON app.orders
  FOR ALL
  TO app_user
  USING (department_id = current_setting('app.department_id')::INTEGER);

CREATE POLICY department_isolation_customers ON app.customers
  FOR ALL
  TO app_user
  USING (department_id = current_setting('app.department_id')::INTEGER);

-- Policy: Admins see everything
CREATE POLICY admin_all_orders ON app.orders
  FOR ALL
  TO app_admin
  USING (true)
  WITH CHECK (true);

-- Audit logging with trigger
CREATE TABLE app.audit_log (
  audit_id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT DEFAULT current_user,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION app.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO app.audit_log (table_name, operation, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO app.audit_log (table_name, operation, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO app.audit_log (table_name, operation, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_audit
  AFTER INSERT OR UPDATE OR DELETE ON app.orders
  FOR EACH ROW EXECUTE FUNCTION app.audit_trigger_func();

-- Connection pooling settings (for pgbouncer)
-- pg_hba.conf example:
-- host    app       api_service    10.0.0.0/8    scram-sha-256
-- host    app       readonly_user  10.0.0.0/8    scram-sha-256`;

// DDL Examples - Oracle
const oracleDDLCode = `-- ============================================
-- Oracle DDL Best Practices
-- ============================================

-- Create main orders table with constraints
CREATE TABLE orders (
  order_id       NUMBER(12) GENERATED BY DEFAULT AS IDENTITY
                 CONSTRAINT pk_orders PRIMARY KEY,
  customer_id    NUMBER(12) NOT NULL
                 CONSTRAINT fk_orders_customer 
                 REFERENCES customers(customer_id),
  order_date     DATE DEFAULT SYSDATE NOT NULL,
  status         VARCHAR2(20) DEFAULT 'PENDING' NOT NULL
                 CONSTRAINT chk_order_status 
                 CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SHIPPED', 'DELIVERED')),
  total_amount   NUMBER(15,2) NOT NULL
                 CONSTRAINT chk_order_amount CHECK (total_amount > 0),
  department_id  NUMBER(6) NOT NULL,
  created_at     TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at     TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  created_by     VARCHAR2(100) DEFAULT SYS_CONTEXT('USERENV', 'SESSION_USER'),
  updated_by     VARCHAR2(100)
)
TABLESPACE app_data
STORAGE (INITIAL 1M NEXT 1M PCTINCREASE 0)
PCTFREE 20
COMPRESS FOR OLTP;

-- Partitioned table by date range
CREATE TABLE order_history (
  order_id       NUMBER(12) NOT NULL,
  customer_id    NUMBER(12) NOT NULL,
  order_date     DATE NOT NULL,
  status         VARCHAR2(20) NOT NULL,
  total_amount   NUMBER(15,2) NOT NULL,
  archived_at    TIMESTAMP DEFAULT SYSTIMESTAMP
)
PARTITION BY RANGE (order_date) (
  PARTITION p_2023_q1 VALUES LESS THAN (DATE '2023-04-01'),
  PARTITION p_2023_q2 VALUES LESS THAN (DATE '2023-07-01'),
  PARTITION p_2023_q3 VALUES LESS THAN (DATE '2023-10-01'),
  PARTITION p_2023_q4 VALUES LESS THAN (DATE '2024-01-01'),
  PARTITION p_2024_q1 VALUES LESS THAN (DATE '2024-04-01'),
  PARTITION p_2024_q2 VALUES LESS THAN (DATE '2024-07-01'),
  PARTITION p_future VALUES LESS THAN (MAXVALUE)
)
TABLESPACE app_data
ENABLE ROW MOVEMENT;

-- Create optimized indexes
CREATE INDEX idx_orders_customer ON orders(customer_id)
  TABLESPACE app_index
  LOCAL;  -- For partitioned tables

CREATE INDEX idx_orders_status ON orders(status)
  TABLESPACE app_index
  COMPRESS 1;

-- Bitmap index for low-cardinality columns (OLAP)
CREATE BITMAP INDEX bix_orders_status ON orders(status)
  TABLESPACE app_index;

-- Function-based index for case-insensitive search
CREATE INDEX idx_customers_name_upper ON customers(UPPER(customer_name))
  TABLESPACE app_index;

-- Invisible index for testing
CREATE INDEX idx_orders_date_invisible ON orders(order_date)
  TABLESPACE app_index
  INVISIBLE;

-- Create materialized view for reporting
CREATE MATERIALIZED VIEW mv_daily_sales
BUILD IMMEDIATE
REFRESH FAST ON DEMAND
ENABLE QUERY REWRITE
AS
SELECT 
  TRUNC(order_date) AS sale_date,
  customer_id,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_sales
FROM orders
WHERE status = 'DELIVERED'
GROUP BY TRUNC(order_date), customer_id;

-- Create materialized view log for fast refresh
CREATE MATERIALIZED VIEW LOG ON orders
WITH ROWID, SEQUENCE (order_date, customer_id, status, total_amount)
INCLUDING NEW VALUES;

-- Online table redefinition for zero-downtime changes
BEGIN
  DBMS_REDEFINITION.START_REDEF_TABLE(
    uname        => 'APP_SCHEMA',
    orig_table   => 'ORDERS',
    int_table    => 'ORDERS_NEW',
    options_flag => DBMS_REDEFINITION.CONS_USE_ROWID
  );
END;
/`;

// DDL Examples - PostgreSQL
const postgresDDLCode = `-- ============================================
-- PostgreSQL DDL Best Practices
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Trigram similarity
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create main orders table
CREATE TABLE app.orders (
  order_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id    UUID NOT NULL REFERENCES app.customers(customer_id)
                 ON DELETE RESTRICT ON UPDATE CASCADE,
  order_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SHIPPED', 'DELIVERED')),
  total_amount   DECIMAL(15,2) NOT NULL CHECK (total_amount > 0),
  department_id  INTEGER NOT NULL,
  metadata       JSONB DEFAULT '{}',
  search_vector  TSVECTOR,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by     TEXT DEFAULT current_user,
  updated_by     TEXT
);

-- Add comments for documentation
COMMENT ON TABLE app.orders IS 'Main orders table with customer orders';
COMMENT ON COLUMN app.orders.status IS 'Order lifecycle status';
COMMENT ON COLUMN app.orders.metadata IS 'Flexible JSONB field for additional data';

-- Partitioned table by range
CREATE TABLE app.order_history (
  order_id       UUID NOT NULL,
  customer_id    UUID NOT NULL,
  order_date     DATE NOT NULL,
  status         VARCHAR(20) NOT NULL,
  total_amount   DECIMAL(15,2) NOT NULL,
  archived_at    TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (order_date);

-- Create partitions
CREATE TABLE app.order_history_2023_q1 PARTITION OF app.order_history
  FOR VALUES FROM ('2023-01-01') TO ('2023-04-01');
CREATE TABLE app.order_history_2023_q2 PARTITION OF app.order_history
  FOR VALUES FROM ('2023-04-01') TO ('2023-07-01');
CREATE TABLE app.order_history_2024_q1 PARTITION OF app.order_history
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

-- Default partition for future data
CREATE TABLE app.order_history_default PARTITION OF app.order_history DEFAULT;

-- Optimized indexes
CREATE INDEX idx_orders_customer ON app.orders(customer_id);
CREATE INDEX idx_orders_status ON app.orders(status) WHERE status = 'PENDING';
CREATE INDEX idx_orders_date ON app.orders(order_date DESC);

-- GIN index for JSONB
CREATE INDEX idx_orders_metadata ON app.orders USING GIN (metadata);

-- GIN index for full-text search
CREATE INDEX idx_orders_search ON app.orders USING GIN (search_vector);

-- Trigram index for fuzzy search
CREATE INDEX idx_customers_name_trgm ON app.customers 
  USING GIN (customer_name gin_trgm_ops);

-- BRIN index for large tables with natural ordering
CREATE INDEX idx_order_history_date_brin ON app.order_history 
  USING BRIN (order_date) WITH (pages_per_range = 32);

-- Create materialized view
CREATE MATERIALIZED VIEW app.mv_daily_sales AS
SELECT 
  order_date::DATE AS sale_date,
  customer_id,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_sales,
  AVG(total_amount) AS avg_order_value
FROM app.orders
WHERE status = 'DELIVERED'
GROUP BY order_date::DATE, customer_id;

CREATE UNIQUE INDEX ON app.mv_daily_sales (sale_date, customer_id);

-- Refresh materialized view concurrently (no locks)
REFRESH MATERIALIZED VIEW CONCURRENTLY app.mv_daily_sales;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION app.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = current_user;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_modtime
  BEFORE UPDATE ON app.orders
  FOR EACH ROW EXECUTE FUNCTION app.update_modified_column();

-- Table maintenance
ANALYZE app.orders;
VACUUM ANALYZE app.orders;`;

const DatabaseSection = () => {
  return (
    <section id="database" className="py-20 px-4">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Database & PL/SQL
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Advanced patterns for Oracle and PostgreSQL database development, user administration, and DDL best practices.
          </p>
        </div>

        {/* Database comparison */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Database className="w-4 h-4 text-terminal-orange" />
                Oracle Database
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>PL/SQL packages & procedures</li>
                <li>Compound triggers</li>
                <li>Pipelined table functions</li>
                <li>Result cache optimization</li>
                <li>Virtual Private Database (VPD)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover border-primary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                PostgreSQL
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>PL/pgSQL functions</li>
                <li>Table partitioning</li>
                <li>JSONB & full-text search</li>
                <li>Window functions</li>
                <li>Row Level Security (RLS)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" />
                Security & Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>User & role management</li>
                <li>Schema administration</li>
                <li>Audit logging</li>
                <li>DDL best practices</li>
                <li>Performance tuning</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plsql" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto">
            <TabsTrigger 
              value="plsql" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              PL/SQL Package
            </TabsTrigger>
            <TabsTrigger 
              value="postgresql" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              PostgreSQL Functions
            </TabsTrigger>
            <TabsTrigger 
              value="oracle-advanced" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Oracle Advanced
            </TabsTrigger>
            <TabsTrigger 
              value="postgres-advanced" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              PostgreSQL Advanced
            </TabsTrigger>
            <TabsTrigger 
              value="oracle-admin" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-3 h-3 mr-1" />
              Oracle Users
            </TabsTrigger>
            <TabsTrigger 
              value="postgres-admin" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="w-3 h-3 mr-1" />
              PostgreSQL Users
            </TabsTrigger>
            <TabsTrigger 
              value="oracle-ddl" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Table className="w-3 h-3 mr-1" />
              Oracle DDL
            </TabsTrigger>
            <TabsTrigger 
              value="postgres-ddl" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Table className="w-3 h-3 mr-1" />
              PostgreSQL DDL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plsql" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Order Processing Package
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Savepoint and rollback handling</li>
                <li>Custom exceptions with PRAGMA</li>
                <li>Bulk collect for performance</li>
                <li>Comprehensive error logging</li>
              </ul>
            </div>
            <CodeBlock 
              code={plsqlPackageCode} 
              language="sql" 
              filename="order_processing_pkg.sql" 
            />
          </TabsContent>

          <TabsContent value="postgresql" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                PostgreSQL Functions & Partitioning
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>SECURITY DEFINER for privilege control</li>
                <li>Table partitioning by range</li>
                <li>Partial indexes for performance</li>
                <li>JSONB for flexible audit logs</li>
              </ul>
            </div>
            <CodeBlock 
              code={postgresqlFunctionCode} 
              language="sql" 
              filename="order_functions.sql" 
            />
          </TabsContent>

          <TabsContent value="oracle-advanced" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Advanced Oracle Patterns
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Pipelined table functions with PARALLEL_ENABLE</li>
                <li>Compound triggers for bulk audit</li>
                <li>Result cache for frequently accessed data</li>
                <li>Parallel query hints</li>
              </ul>
            </div>
            <CodeBlock 
              code={oracleAdvancedCode} 
              language="sql" 
              filename="oracle_advanced_patterns.sql" 
            />
          </TabsContent>

          <TabsContent value="postgres-advanced" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Advanced PostgreSQL Patterns
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Recursive CTEs for hierarchical data</li>
                <li>Window functions for analytics</li>
                <li>JSONB operations and indexing</li>
                <li>Full-text search with ranking</li>
              </ul>
            </div>
            <CodeBlock 
              code={postgresAdvancedCode} 
              language="sql" 
              filename="postgres_advanced_patterns.sql" 
            />
          </TabsContent>

          <TabsContent value="oracle-admin" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Oracle User & Security Administration
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Tablespace and quota management</li>
                <li>Role-based access control (RBAC)</li>
                <li>Password profiles and security policies</li>
                <li>Virtual Private Database (VPD) for row-level security</li>
                <li>Audit policies for compliance</li>
              </ul>
            </div>
            <CodeBlock 
              code={oracleUserAdminCode} 
              language="sql" 
              filename="oracle_user_admin.sql" 
            />
          </TabsContent>

          <TabsContent value="postgres-admin" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                PostgreSQL User & Security Administration
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Role hierarchy and inheritance</li>
                <li>Schema-level permissions</li>
                <li>Row Level Security (RLS) policies</li>
                <li>Audit logging with triggers</li>
                <li>Connection pooling configuration</li>
              </ul>
            </div>
            <CodeBlock 
              code={postgresUserAdminCode} 
              language="sql" 
              filename="postgres_user_admin.sql" 
            />
          </TabsContent>

          <TabsContent value="oracle-ddl" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Oracle DDL Best Practices
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Table constraints and storage clauses</li>
                <li>Partitioning strategies (range, list, hash)</li>
                <li>Index types (B-tree, bitmap, function-based)</li>
                <li>Materialized views with fast refresh</li>
                <li>Online table redefinition</li>
              </ul>
            </div>
            <CodeBlock 
              code={oracleDDLCode} 
              language="sql" 
              filename="oracle_ddl_examples.sql" 
            />
          </TabsContent>

          <TabsContent value="postgres-ddl" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                PostgreSQL DDL Best Practices
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>UUID primary keys and constraints</li>
                <li>Native partitioning with default partition</li>
                <li>Specialized indexes (GIN, BRIN, trigram)</li>
                <li>Materialized views with concurrent refresh</li>
                <li>Automatic timestamp triggers</li>
              </ul>
            </div>
            <CodeBlock 
              code={postgresDDLCode} 
              language="sql" 
              filename="postgres_ddl_examples.sql" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DatabaseSection;
