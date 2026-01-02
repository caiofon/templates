import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Zap, Lock } from "lucide-react";
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

const DatabaseSection = () => {
  return (
    <section id="database" className="py-20 px-4">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Database & PL/SQL
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Advanced patterns for Oracle and PostgreSQL database development.
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
                <li>Parallel query execution</li>
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
                <li>Recursive CTEs</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Transaction management</li>
                <li>Error handling patterns</li>
                <li>Bulk operations</li>
                <li>Index optimization</li>
                <li>Audit logging</li>
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
              value="postgres" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              PostgreSQL Functions
            </TabsTrigger>
            <TabsTrigger 
              value="oracle-adv" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Oracle Advanced
            </TabsTrigger>
            <TabsTrigger 
              value="postgres-adv" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              PostgreSQL Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plsql" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Oracle PL/SQL Package Pattern
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Savepoint for transaction rollback</li>
                <li>FOR UPDATE NOWAIT for row locking</li>
                <li>Custom exception handling</li>
                <li>Bulk collect and FORALL operations</li>
              </ul>
            </div>
            <CodeBlock 
              code={plsqlPackageCode} 
              language="sql" 
              filename="order_processing_pkg.pkb" 
            />
          </TabsContent>

          <TabsContent value="postgres" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                PostgreSQL Functions & Partitioning
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>PL/pgSQL with SECURITY DEFINER</li>
                <li>Range partitioning by date</li>
                <li>Partial indexes for performance</li>
                <li>JSONB for audit logging</li>
              </ul>
            </div>
            <CodeBlock 
              code={postgresqlFunctionCode} 
              language="sql" 
              filename="order_functions.sql" 
            />
          </TabsContent>

          <TabsContent value="oracle-adv" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Advanced Oracle Patterns
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Pipelined functions with PARALLEL_ENABLE</li>
                <li>Compound triggers for complex logic</li>
                <li>Result cache for performance</li>
                <li>Bulk operations with FORALL</li>
              </ul>
            </div>
            <CodeBlock 
              code={oracleAdvancedCode} 
              language="sql" 
              filename="advanced_oracle.sql" 
            />
          </TabsContent>

          <TabsContent value="postgres-adv" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Advanced PostgreSQL Patterns
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Recursive CTEs for hierarchies</li>
                <li>Window functions for analytics</li>
                <li>JSONB with GIN indexes</li>
                <li>Full-text search with ranking</li>
              </ul>
            </div>
            <CodeBlock 
              code={postgresAdvancedCode} 
              language="sql" 
              filename="advanced_postgres.sql" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DatabaseSection;
