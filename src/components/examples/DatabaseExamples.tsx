import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

// Oracle PL/SQL Collections
const oracleCollections = `-- Oracle PL/SQL - Collections e Bulk Operations
-- ================================================

-- 1. Nested Tables
DECLARE
    TYPE t_names IS TABLE OF VARCHAR2(100);
    v_names t_names := t_names('Alice', 'Bob', 'Charlie');
BEGIN
    -- Extend and add
    v_names.EXTEND;
    v_names(v_names.LAST) := 'David';
    
    -- Iterate
    FOR i IN v_names.FIRST .. v_names.LAST LOOP
        IF v_names.EXISTS(i) THEN
            DBMS_OUTPUT.PUT_LINE(v_names(i));
        END IF;
    END LOOP;
    
    -- Collection methods
    DBMS_OUTPUT.PUT_LINE('Count: ' || v_names.COUNT);
    DBMS_OUTPUT.PUT_LINE('First: ' || v_names.FIRST);
    DBMS_OUTPUT.PUT_LINE('Last: ' || v_names.LAST);
    
    -- Delete element
    v_names.DELETE(2);
    
    -- Trim last element
    v_names.TRIM;
END;
/

-- 2. Associative Arrays (Index-By Tables)
DECLARE
    TYPE t_salary_by_dept IS TABLE OF NUMBER INDEX BY VARCHAR2(50);
    v_salaries t_salary_by_dept;
    v_dept VARCHAR2(50);
BEGIN
    -- Populate
    v_salaries('Engineering') := 150000;
    v_salaries('Sales') := 120000;
    v_salaries('Marketing') := 100000;
    v_salaries('HR') := 90000;
    
    -- Check existence
    IF v_salaries.EXISTS('Engineering') THEN
        DBMS_OUTPUT.PUT_LINE('Engineering salary: ' || v_salaries('Engineering'));
    END IF;
    
    -- Iterate using FIRST/NEXT
    v_dept := v_salaries.FIRST;
    WHILE v_dept IS NOT NULL LOOP
        DBMS_OUTPUT.PUT_LINE(v_dept || ': ' || v_salaries(v_dept));
        v_dept := v_salaries.NEXT(v_dept);
    END LOOP;
END;
/

-- 3. VARRAYs (Variable-Size Arrays)
CREATE OR REPLACE TYPE t_phone_numbers AS VARRAY(5) OF VARCHAR2(20);
/

CREATE TABLE customers (
    customer_id   NUMBER PRIMARY KEY,
    name          VARCHAR2(100),
    phone_numbers t_phone_numbers
);

-- Insert with VARRAY
INSERT INTO customers VALUES (
    1,
    'John Doe',
    t_phone_numbers('+55-11-99999-0001', '+55-11-99999-0002')
);

-- Query VARRAY
SELECT c.name, p.COLUMN_VALUE AS phone
FROM customers c,
     TABLE(c.phone_numbers) p
WHERE c.customer_id = 1;

-- 4. Bulk Collect com Limit
DECLARE
    TYPE t_order_tab IS TABLE OF orders%ROWTYPE;
    v_orders t_order_tab;
    
    CURSOR c_orders IS
        SELECT * FROM orders WHERE status = 'PENDING';
    
    c_limit CONSTANT PLS_INTEGER := 1000;
BEGIN
    OPEN c_orders;
    LOOP
        FETCH c_orders BULK COLLECT INTO v_orders LIMIT c_limit;
        EXIT WHEN v_orders.COUNT = 0;
        
        -- Process batch
        FOR i IN 1..v_orders.COUNT LOOP
            process_order(v_orders(i));
        END LOOP;
        
        COMMIT;
    END LOOP;
    CLOSE c_orders;
END;
/

-- 5. FORALL para DML em massa
DECLARE
    TYPE t_order_ids IS TABLE OF orders.order_id%TYPE;
    TYPE t_statuses IS TABLE OF orders.status%TYPE;
    
    v_order_ids t_order_ids;
    v_statuses  t_statuses;
BEGIN
    -- Coletar orders para atualizar
    SELECT order_id, 'PROCESSED'
    BULK COLLECT INTO v_order_ids, v_statuses
    FROM orders
    WHERE status = 'PENDING'
      AND created_at < SYSDATE - 1;
    
    -- Atualização em massa com FORALL
    FORALL i IN 1..v_order_ids.COUNT
        UPDATE orders
        SET status = v_statuses(i),
            processed_at = SYSTIMESTAMP
        WHERE order_id = v_order_ids(i);
    
    DBMS_OUTPUT.PUT_LINE('Updated: ' || SQL%ROWCOUNT || ' orders');
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- SAVE EXCEPTIONS permite continuar mesmo com erros
        FOR j IN 1..SQL%BULK_EXCEPTIONS.COUNT LOOP
            DBMS_OUTPUT.PUT_LINE(
                'Error at index ' || SQL%BULK_EXCEPTIONS(j).ERROR_INDEX ||
                ': ' || SQLERRM(-SQL%BULK_EXCEPTIONS(j).ERROR_CODE)
            );
        END LOOP;
        ROLLBACK;
END;
/

-- 6. Table Function retornando Collection
CREATE OR REPLACE TYPE t_order_rec AS OBJECT (
    order_id     NUMBER,
    customer_id  NUMBER,
    total_amount NUMBER,
    order_date   DATE
);
/

CREATE OR REPLACE TYPE t_order_tab AS TABLE OF t_order_rec;
/

CREATE OR REPLACE FUNCTION get_orders_by_customer(
    p_customer_id IN NUMBER
) RETURN t_order_tab PIPELINED
IS
BEGIN
    FOR rec IN (
        SELECT order_id, customer_id, total_amount, order_date
        FROM orders
        WHERE customer_id = p_customer_id
        ORDER BY order_date DESC
    ) LOOP
        PIPE ROW (t_order_rec(
            rec.order_id,
            rec.customer_id,
            rec.total_amount,
            rec.order_date
        ));
    END LOOP;
    RETURN;
END;
/

-- Uso da Table Function
SELECT * FROM TABLE(get_orders_by_customer(12345))
WHERE total_amount > 1000;`;

// Oracle Package Integration
const oraclePackageIntegration = `-- Oracle Package - Integração com External Systems
-- ================================================

CREATE OR REPLACE PACKAGE integration_pkg AS
    
    -- Constants
    c_timeout     CONSTANT NUMBER := 30;
    c_max_retries CONSTANT NUMBER := 3;
    
    -- Types
    TYPE t_http_headers IS TABLE OF VARCHAR2(4000) INDEX BY VARCHAR2(100);
    
    TYPE t_api_response IS RECORD (
        status_code   NUMBER,
        body          CLOB,
        headers       t_http_headers,
        elapsed_time  NUMBER
    );
    
    -- HTTP Client procedures
    FUNCTION http_get(
        p_url     IN VARCHAR2,
        p_headers IN t_http_headers DEFAULT NULL
    ) RETURN t_api_response;
    
    FUNCTION http_post(
        p_url         IN VARCHAR2,
        p_body        IN CLOB,
        p_headers     IN t_http_headers DEFAULT NULL,
        p_content_type IN VARCHAR2 DEFAULT 'application/json'
    ) RETURN t_api_response;
    
    -- Order sync procedures
    PROCEDURE sync_order_to_erp(
        p_order_id IN orders.order_id%TYPE,
        p_result   OUT VARCHAR2,
        p_error    OUT VARCHAR2
    );
    
    PROCEDURE batch_sync_orders(
        p_start_date IN DATE,
        p_end_date   IN DATE
    );
    
END integration_pkg;
/

CREATE OR REPLACE PACKAGE BODY integration_pkg AS

    -- Private: HTTP request helper
    FUNCTION make_http_request(
        p_method  IN VARCHAR2,
        p_url     IN VARCHAR2,
        p_body    IN CLOB DEFAULT NULL,
        p_headers IN t_http_headers DEFAULT NULL
    ) RETURN t_api_response
    IS
        v_req        UTL_HTTP.REQ;
        v_resp       UTL_HTTP.RESP;
        v_response   t_api_response;
        v_buffer     VARCHAR2(32767);
        v_start_time TIMESTAMP := SYSTIMESTAMP;
        v_header_key VARCHAR2(100);
    BEGIN
        -- Configure timeout
        UTL_HTTP.SET_TRANSFER_TIMEOUT(c_timeout);
        
        -- Create request
        v_req := UTL_HTTP.BEGIN_REQUEST(
            url    => p_url,
            method => p_method
        );
        
        -- Set headers
        UTL_HTTP.SET_HEADER(v_req, 'User-Agent', 'OracleIntegration/1.0');
        
        IF p_headers IS NOT NULL THEN
            v_header_key := p_headers.FIRST;
            WHILE v_header_key IS NOT NULL LOOP
                UTL_HTTP.SET_HEADER(v_req, v_header_key, p_headers(v_header_key));
                v_header_key := p_headers.NEXT(v_header_key);
            END LOOP;
        END IF;
        
        -- Write body for POST/PUT
        IF p_body IS NOT NULL THEN
            UTL_HTTP.SET_HEADER(v_req, 'Content-Length', LENGTH(p_body));
            UTL_HTTP.WRITE_TEXT(v_req, p_body);
        END IF;
        
        -- Get response
        v_resp := UTL_HTTP.GET_RESPONSE(v_req);
        v_response.status_code := v_resp.status_code;
        
        -- Read response body
        DBMS_LOB.CREATETEMPORARY(v_response.body, TRUE);
        BEGIN
            LOOP
                UTL_HTTP.READ_TEXT(v_resp, v_buffer, 32767);
                DBMS_LOB.WRITEAPPEND(v_response.body, LENGTH(v_buffer), v_buffer);
            END LOOP;
        EXCEPTION
            WHEN UTL_HTTP.END_OF_BODY THEN
                NULL;
        END;
        
        UTL_HTTP.END_RESPONSE(v_resp);
        
        v_response.elapsed_time := 
            EXTRACT(SECOND FROM (SYSTIMESTAMP - v_start_time));
        
        RETURN v_response;
        
    EXCEPTION
        WHEN OTHERS THEN
            IF v_req.private_hndl IS NOT NULL THEN
                UTL_HTTP.END_REQUEST(v_req);
            END IF;
            RAISE;
    END make_http_request;
    
    FUNCTION http_get(
        p_url     IN VARCHAR2,
        p_headers IN t_http_headers DEFAULT NULL
    ) RETURN t_api_response
    IS
    BEGIN
        RETURN make_http_request('GET', p_url, NULL, p_headers);
    END http_get;
    
    FUNCTION http_post(
        p_url          IN VARCHAR2,
        p_body         IN CLOB,
        p_headers      IN t_http_headers DEFAULT NULL,
        p_content_type IN VARCHAR2 DEFAULT 'application/json'
    ) RETURN t_api_response
    IS
        v_headers t_http_headers := NVL(p_headers, t_http_headers());
    BEGIN
        v_headers('Content-Type') := p_content_type;
        RETURN make_http_request('POST', p_url, p_body, v_headers);
    END http_post;
    
    PROCEDURE sync_order_to_erp(
        p_order_id IN orders.order_id%TYPE,
        p_result   OUT VARCHAR2,
        p_error    OUT VARCHAR2
    ) IS
        v_order_json  CLOB;
        v_response    t_api_response;
        v_headers     t_http_headers;
        v_attempt     NUMBER := 0;
    BEGIN
        -- Build JSON payload
        SELECT JSON_OBJECT(
            'orderId'      VALUE o.order_id,
            'customerId'   VALUE o.customer_id,
            'orderDate'    VALUE TO_CHAR(o.order_date, 'YYYY-MM-DD'),
            'totalAmount'  VALUE o.total_amount,
            'status'       VALUE o.status,
            'items'        VALUE (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'productId' VALUE oi.product_id,
                        'quantity'  VALUE oi.quantity,
                        'unitPrice' VALUE oi.unit_price
                    )
                )
                FROM order_items oi
                WHERE oi.order_id = o.order_id
            )
        )
        INTO v_order_json
        FROM orders o
        WHERE o.order_id = p_order_id;
        
        -- Set headers
        v_headers('Authorization') := 'Bearer ' || get_erp_token();
        v_headers('X-Correlation-Id') := SYS_GUID();
        
        -- Retry loop
        WHILE v_attempt < c_max_retries LOOP
            v_attempt := v_attempt + 1;
            
            BEGIN
                v_response := http_post(
                    p_url  => 'https://erp.company.com/api/orders',
                    p_body => v_order_json,
                    p_headers => v_headers
                );
                
                IF v_response.status_code BETWEEN 200 AND 299 THEN
                    p_result := 'SUCCESS';
                    
                    -- Log success
                    INSERT INTO integration_log (
                        log_id, order_id, direction, status,
                        request_body, response_body, elapsed_time, created_at
                    ) VALUES (
                        integration_log_seq.NEXTVAL, p_order_id, 'OUTBOUND', 'SUCCESS',
                        v_order_json, v_response.body, v_response.elapsed_time, SYSTIMESTAMP
                    );
                    
                    RETURN;
                END IF;
                
            EXCEPTION
                WHEN OTHERS THEN
                    IF v_attempt = c_max_retries THEN
                        RAISE;
                    END IF;
                    DBMS_SESSION.SLEEP(v_attempt * 2); -- Exponential backoff
            END;
        END LOOP;
        
        p_result := 'FAILED';
        p_error := 'Max retries exceeded. Status: ' || v_response.status_code;
        
    EXCEPTION
        WHEN OTHERS THEN
            p_result := 'ERROR';
            p_error := SQLERRM;
            
            INSERT INTO integration_log (
                log_id, order_id, direction, status,
                error_message, created_at
            ) VALUES (
                integration_log_seq.NEXTVAL, p_order_id, 'OUTBOUND', 'ERROR',
                SQLERRM, SYSTIMESTAMP
            );
    END sync_order_to_erp;
    
    PROCEDURE batch_sync_orders(
        p_start_date IN DATE,
        p_end_date   IN DATE
    ) IS
        TYPE t_order_ids IS TABLE OF orders.order_id%TYPE;
        v_order_ids   t_order_ids;
        v_result      VARCHAR2(20);
        v_error       VARCHAR2(4000);
        v_success_cnt NUMBER := 0;
        v_error_cnt   NUMBER := 0;
    BEGIN
        -- Collect orders to sync
        SELECT order_id
        BULK COLLECT INTO v_order_ids
        FROM orders
        WHERE order_date BETWEEN p_start_date AND p_end_date
          AND sync_status IS NULL
        ORDER BY order_date;
        
        -- Process each order
        FOR i IN 1..v_order_ids.COUNT LOOP
            sync_order_to_erp(v_order_ids(i), v_result, v_error);
            
            IF v_result = 'SUCCESS' THEN
                v_success_cnt := v_success_cnt + 1;
                UPDATE orders 
                SET sync_status = 'SYNCED', 
                    sync_date = SYSTIMESTAMP
                WHERE order_id = v_order_ids(i);
            ELSE
                v_error_cnt := v_error_cnt + 1;
                UPDATE orders 
                SET sync_status = 'FAILED',
                    sync_error = v_error
                WHERE order_id = v_order_ids(i);
            END IF;
            
            -- Commit every 100 orders
            IF MOD(i, 100) = 0 THEN
                COMMIT;
            END IF;
        END LOOP;
        
        COMMIT;
        
        DBMS_OUTPUT.PUT_LINE('Sync completed. Success: ' || v_success_cnt || 
                            ', Errors: ' || v_error_cnt);
    END batch_sync_orders;

END integration_pkg;
/`;

// PostgreSQL Advanced
const postgresAdvanced = `-- PostgreSQL - Advanced Features
-- ================================

-- 1. JSONB Operations
CREATE TABLE order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index for JSONB
CREATE INDEX idx_order_events_data ON order_events USING GIN (event_data);
CREATE INDEX idx_order_events_type ON order_events USING GIN ((event_data->'type'));

-- Query JSONB
SELECT 
    id,
    event_type,
    event_data->>'status' AS status,
    event_data->'metadata'->>'source' AS source,
    (event_data->>'amount')::DECIMAL AS amount,
    jsonb_array_length(event_data->'items') AS item_count
FROM order_events
WHERE event_data @> '{"priority": "high"}'
  AND event_data ? 'metadata'
  AND (event_data->>'amount')::DECIMAL > 1000;

-- JSONB aggregation
SELECT 
    customer_id,
    jsonb_agg(
        jsonb_build_object(
            'order_id', order_id,
            'amount', total_amount,
            'date', order_date
        ) ORDER BY order_date DESC
    ) AS orders
FROM orders
GROUP BY customer_id;

-- Update JSONB
UPDATE order_events
SET event_data = event_data || '{"processed": true, "processed_at": "2024-01-15"}'::jsonb
WHERE event_type = 'ORDER_CREATED'
  AND NOT (event_data ? 'processed');

-- 2. Window Functions
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
    ) AS running_total,
    -- Rank within customer
    RANK() OVER (
        PARTITION BY customer_id 
        ORDER BY order_amount DESC
    ) AS amount_rank,
    -- Difference from previous
    order_amount - LAG(order_amount) OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
    ) AS amount_change,
    -- Moving average (3 orders)
    AVG(order_amount) OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_3,
    -- Percentile
    PERCENT_RANK() OVER (
        PARTITION BY customer_id 
        ORDER BY order_amount
    ) AS percentile
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '1 year';

-- 3. Recursive CTE for hierarchical data
WITH RECURSIVE category_tree AS (
    -- Base: root categories
    SELECT 
        id,
        name,
        parent_id,
        1 AS level,
        name::TEXT AS path,
        ARRAY[id] AS path_ids
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive
    SELECT 
        c.id,
        c.name,
        c.parent_id,
        ct.level + 1,
        ct.path || ' > ' || c.name,
        ct.path_ids || c.id
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;

-- 4. Full-text search
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Trigger para atualizar search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('portuguese', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.brand, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Search with ranking
SELECT 
    id,
    name,
    description,
    ts_rank(search_vector, query) AS rank,
    ts_headline('portuguese', description, query) AS highlighted
FROM products, 
     plainto_tsquery('portuguese', 'smartphone samsung') AS query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;

-- 5. Partitioning
CREATE TABLE orders_partitioned (
    id UUID NOT NULL,
    customer_id UUID NOT NULL,
    order_date TIMESTAMPTZ NOT NULL,
    total_amount DECIMAL(15,2),
    status VARCHAR(20),
    PRIMARY KEY (id, order_date)
) PARTITION BY RANGE (order_date);

-- Create monthly partitions
CREATE TABLE orders_2024_01 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_2024_02 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Default partition for future dates
CREATE TABLE orders_default PARTITION OF orders_partitioned DEFAULT;

-- Function to create partitions automatically
CREATE OR REPLACE FUNCTION create_monthly_partition(
    p_table_name TEXT,
    p_date DATE
) RETURNS VOID AS $$
DECLARE
    v_partition_name TEXT;
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    v_start_date := DATE_TRUNC('month', p_date);
    v_end_date := v_start_date + INTERVAL '1 month';
    v_partition_name := p_table_name || '_' || TO_CHAR(p_date, 'YYYY_MM');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        v_partition_name,
        p_table_name,
        v_start_date,
        v_end_date
    );
END;
$$ LANGUAGE plpgsql;`;

// PostgreSQL RLS and Security
const postgresRLS = `-- PostgreSQL - Row Level Security (RLS)
-- ======================================

-- 1. Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 2. Create policies
-- Users can only see their own orders
CREATE POLICY orders_user_isolation ON orders
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Admins can see all orders
CREATE POLICY orders_admin_full_access ON orders
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = current_setting('app.current_user_id')::UUID 
            AND role = 'admin'
        )
    );

-- 3. Service-level bypass (para funções internas)
CREATE ROLE app_service NOLOGIN;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
GRANT ALL ON orders TO app_service;

-- Function com SECURITY DEFINER para bypass
CREATE OR REPLACE FUNCTION admin_get_all_orders()
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar se é admin
    IF NOT is_admin(current_setting('app.current_user_id')::UUID) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    RETURN QUERY SELECT * FROM orders;
END;
$$;

-- 4. RLS com condições complexas
CREATE POLICY order_items_through_order ON order_items
    FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- 5. Multi-tenant isolation
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE tenant_users (
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, tenant_id)
);

-- Function para obter tenant do usuário atual
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id 
    FROM tenant_users 
    WHERE user_id = current_setting('app.current_user_id')::UUID
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Policy multi-tenant
CREATE POLICY tenant_isolation ON orders
    FOR ALL
    USING (tenant_id = get_current_tenant_id());

-- 6. Audit logging com RLS
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name, record_id, action,
        old_data, new_data, user_id, ip_address
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::JSONB END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::JSONB END,
        current_setting('app.current_user_id', true)::UUID,
        current_setting('app.client_ip', true)::INET
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER orders_audit
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();`;

// Oracle DDL Best Practices
const oracleDDL = `-- Oracle DDL - Best Practices & Patterns
-- =======================================

-- 1. Table with comprehensive constraints
CREATE TABLE customers (
    customer_id      NUMBER GENERATED ALWAYS AS IDENTITY,
    email            VARCHAR2(255) NOT NULL,
    full_name        VARCHAR2(200) NOT NULL,
    phone            VARCHAR2(20),
    document_type    VARCHAR2(4) DEFAULT 'CPF' NOT NULL,
    document_number  VARCHAR2(20) NOT NULL,
    status           VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    credit_limit     NUMBER(15,2) DEFAULT 0,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE,
    created_by       VARCHAR2(100) DEFAULT SYS_CONTEXT('USERENV', 'SESSION_USER'),
    
    CONSTRAINT pk_customers PRIMARY KEY (customer_id),
    CONSTRAINT uk_customers_email UNIQUE (email),
    CONSTRAINT uk_customers_document UNIQUE (document_type, document_number),
    CONSTRAINT ck_customers_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
    CONSTRAINT ck_customers_doc_type CHECK (document_type IN ('CPF', 'CNPJ')),
    CONSTRAINT ck_customers_credit CHECK (credit_limit >= 0)
)
TABLESPACE app_data
PCTFREE 20
INITRANS 2
STORAGE (
    INITIAL 1M
    NEXT 1M
    PCTINCREASE 0
)
COMPRESS FOR OLTP;

-- 2. Partitioned table
CREATE TABLE order_history (
    order_id         NUMBER NOT NULL,
    customer_id      NUMBER NOT NULL,
    order_date       DATE NOT NULL,
    total_amount     NUMBER(15,2),
    status           VARCHAR2(20),
    CONSTRAINT pk_order_history PRIMARY KEY (order_id, order_date)
)
PARTITION BY RANGE (order_date)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
(
    PARTITION p_initial VALUES LESS THAN (DATE '2024-01-01')
)
TABLESPACE app_data;

-- Subpartition by status
CREATE TABLE order_details (
    detail_id        NUMBER GENERATED ALWAYS AS IDENTITY,
    order_id         NUMBER NOT NULL,
    order_date       DATE NOT NULL,
    status           VARCHAR2(20) NOT NULL,
    product_id       NUMBER NOT NULL,
    quantity         NUMBER NOT NULL,
    unit_price       NUMBER(15,2) NOT NULL
)
PARTITION BY RANGE (order_date)
SUBPARTITION BY LIST (status)
SUBPARTITION TEMPLATE (
    SUBPARTITION sp_pending VALUES ('PENDING'),
    SUBPARTITION sp_processing VALUES ('PROCESSING'),
    SUBPARTITION sp_completed VALUES ('COMPLETED', 'SHIPPED', 'DELIVERED'),
    SUBPARTITION sp_cancelled VALUES ('CANCELLED', 'REFUNDED')
)
(
    PARTITION p_2024_q1 VALUES LESS THAN (DATE '2024-04-01'),
    PARTITION p_2024_q2 VALUES LESS THAN (DATE '2024-07-01'),
    PARTITION p_2024_q3 VALUES LESS THAN (DATE '2024-10-01'),
    PARTITION p_2024_q4 VALUES LESS THAN (DATE '2025-01-01')
);

-- 3. Indexes strategies
-- Bitmap index for low cardinality columns
CREATE BITMAP INDEX idx_orders_status ON orders(status)
TABLESPACE app_index LOCAL;

-- Function-based index
CREATE INDEX idx_customers_email_upper ON customers(UPPER(email))
TABLESPACE app_index;

-- Partial index (filtered)
CREATE INDEX idx_orders_pending ON orders(customer_id, created_at)
WHERE status = 'PENDING'
TABLESPACE app_index;

-- Composite index with included columns
CREATE INDEX idx_orders_customer ON orders(customer_id, order_date DESC)
INCLUDE (total_amount, status)
TABLESPACE app_index;

-- Invisible index (for testing)
CREATE INDEX idx_test_invisible ON orders(updated_at) INVISIBLE;

-- 4. Materialized View for reporting
CREATE MATERIALIZED VIEW mv_daily_sales
BUILD IMMEDIATE
REFRESH FAST ON DEMAND
ENABLE QUERY REWRITE
AS
SELECT 
    TRUNC(order_date) AS sale_date,
    customer_id,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_sales,
    AVG(total_amount) AS avg_order_value
FROM orders
WHERE status = 'COMPLETED'
GROUP BY TRUNC(order_date), customer_id;

-- Create MV log for fast refresh
CREATE MATERIALIZED VIEW LOG ON orders
WITH ROWID, SEQUENCE (order_date, customer_id, total_amount, status)
INCLUDING NEW VALUES;

-- 5. Virtual Columns
ALTER TABLE orders ADD (
    order_year AS (EXTRACT(YEAR FROM order_date)),
    order_month AS (EXTRACT(MONTH FROM order_date)),
    is_high_value AS (CASE WHEN total_amount > 10000 THEN 'Y' ELSE 'N' END)
);

-- Index on virtual column
CREATE INDEX idx_orders_high_value ON orders(is_high_value)
WHERE is_high_value = 'Y';

-- 6. Table compression
ALTER TABLE order_history MOVE PARTITION p_initial 
COMPRESS FOR ARCHIVE HIGH;

-- Online table redefinition for zero downtime
EXEC DBMS_REDEFINITION.START_REDEF_TABLE(
    uname      => 'APP_SCHEMA',
    orig_table => 'ORDERS',
    int_table  => 'ORDERS_NEW',
    options_flag => DBMS_REDEFINITION.CONS_USE_ROWID
);`;

// Oracle User Administration
const oracleUserAdmin = `-- Oracle User Administration
-- ===========================

-- 1. Create tablespaces
CREATE TABLESPACE app_data
    DATAFILE '/u01/oradata/ORCL/app_data01.dbf'
    SIZE 2G AUTOEXTEND ON NEXT 500M MAXSIZE 20G
    EXTENT MANAGEMENT LOCAL
    SEGMENT SPACE MANAGEMENT AUTO;

CREATE TABLESPACE app_index
    DATAFILE '/u01/oradata/ORCL/app_index01.dbf'
    SIZE 1G AUTOEXTEND ON NEXT 200M MAXSIZE 10G;

CREATE TEMPORARY TABLESPACE app_temp
    TEMPFILE '/u01/oradata/ORCL/app_temp01.dbf'
    SIZE 500M AUTOEXTEND ON NEXT 100M MAXSIZE 5G;

-- 2. Create profiles for different user types
CREATE PROFILE app_user_profile LIMIT
    SESSIONS_PER_USER 10
    CPU_PER_SESSION UNLIMITED
    CONNECT_TIME UNLIMITED
    IDLE_TIME 30
    FAILED_LOGIN_ATTEMPTS 5
    PASSWORD_LIFE_TIME 90
    PASSWORD_REUSE_TIME 365
    PASSWORD_REUSE_MAX 10
    PASSWORD_LOCK_TIME 1
    PASSWORD_GRACE_TIME 7
    PASSWORD_VERIFY_FUNCTION ora12c_verify_function;

CREATE PROFILE app_service_profile LIMIT
    SESSIONS_PER_USER UNLIMITED
    CPU_PER_SESSION UNLIMITED
    CONNECT_TIME UNLIMITED
    IDLE_TIME UNLIMITED
    FAILED_LOGIN_ATTEMPTS 3
    PASSWORD_LIFE_TIME UNLIMITED;

-- 3. Create roles
CREATE ROLE app_readonly;
CREATE ROLE app_readwrite;
CREATE ROLE app_admin;
CREATE ROLE app_developer;

-- 4. Grant privileges to roles
-- Read-only role
GRANT CREATE SESSION TO app_readonly;
GRANT SELECT ANY TABLE TO app_readonly;
GRANT SELECT ON app_schema.orders TO app_readonly;
GRANT SELECT ON app_schema.customers TO app_readonly;
GRANT SELECT ON app_schema.products TO app_readonly;

-- Read-write role
GRANT app_readonly TO app_readwrite;
GRANT INSERT, UPDATE, DELETE ON app_schema.orders TO app_readwrite;
GRANT INSERT, UPDATE, DELETE ON app_schema.order_items TO app_readwrite;
GRANT EXECUTE ON app_schema.order_processing_pkg TO app_readwrite;

-- Admin role
GRANT app_readwrite TO app_admin;
GRANT ALTER ANY TABLE TO app_admin;
GRANT CREATE ANY INDEX TO app_admin;
GRANT EXECUTE ANY PROCEDURE TO app_admin;
GRANT SELECT ANY DICTIONARY TO app_admin;

-- Developer role
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE PROCEDURE,
      CREATE SEQUENCE, CREATE TRIGGER, CREATE TYPE, CREATE SYNONYM
TO app_developer;

-- 5. Create users
CREATE USER app_owner
    IDENTIFIED BY "ComplexP@ssw0rd!"
    DEFAULT TABLESPACE app_data
    TEMPORARY TABLESPACE app_temp
    QUOTA UNLIMITED ON app_data
    QUOTA UNLIMITED ON app_index
    PROFILE app_service_profile
    ACCOUNT UNLOCK;

CREATE USER app_service
    IDENTIFIED BY "ServiceP@ss123!"
    DEFAULT TABLESPACE app_data
    TEMPORARY TABLESPACE app_temp
    QUOTA 0 ON app_data
    PROFILE app_service_profile;

CREATE USER app_readonly_user
    IDENTIFIED BY "ReadOnlyP@ss!"
    DEFAULT TABLESPACE app_data
    TEMPORARY TABLESPACE app_temp
    PROFILE app_user_profile;

-- 6. Grant roles to users
GRANT app_admin TO app_owner WITH ADMIN OPTION;
GRANT app_readwrite TO app_service;
GRANT app_readonly TO app_readonly_user;

-- 7. Audit configuration
AUDIT SELECT, INSERT, UPDATE, DELETE ON app_schema.customers BY ACCESS;
AUDIT SELECT, INSERT, UPDATE, DELETE ON app_schema.orders BY ACCESS;
AUDIT EXECUTE ON app_schema.order_processing_pkg BY ACCESS;

-- Unified Auditing (12c+)
CREATE AUDIT POLICY sensitive_data_access
    ACTIONS SELECT ON app_schema.customers,
            SELECT ON app_schema.payment_info
    WHEN 'SYS_CONTEXT(''USERENV'', ''SESSION_USER'') NOT IN (''APP_OWNER'', ''APP_SERVICE'')'
    EVALUATE PER SESSION;

AUDIT POLICY sensitive_data_access;

-- 8. VPD (Virtual Private Database) for row-level security
CREATE OR REPLACE FUNCTION vpd_orders_policy(
    p_schema IN VARCHAR2,
    p_table  IN VARCHAR2
) RETURN VARCHAR2
AS
    v_user VARCHAR2(100);
BEGIN
    v_user := SYS_CONTEXT('USERENV', 'SESSION_USER');
    
    -- Admins see all
    IF v_user IN ('APP_OWNER', 'APP_ADMIN') THEN
        RETURN NULL;
    END IF;
    
    -- Service account uses application context
    IF v_user = 'APP_SERVICE' THEN
        RETURN 'customer_id = SYS_CONTEXT(''APP_CTX'', ''CUSTOMER_ID'')';
    END IF;
    
    -- Default: no access
    RETURN '1=0';
END;
/

BEGIN
    DBMS_RLS.ADD_POLICY(
        object_schema   => 'APP_SCHEMA',
        object_name     => 'ORDERS',
        policy_name     => 'VPD_ORDERS',
        function_schema => 'APP_SCHEMA',
        policy_function => 'VPD_ORDERS_POLICY',
        statement_types => 'SELECT, INSERT, UPDATE, DELETE',
        update_check    => TRUE
    );
END;
/`;

const categories = [
  {
    id: "oracle-collections",
    title: "Oracle PL/SQL Collections",
    badge: "Oracle",
    examples: [
      { title: "Collections & Bulk Operations", code: oracleCollections, filename: "collections.sql" },
    ]
  },
  {
    id: "oracle-integration",
    title: "Oracle Package Integration",
    badge: "Oracle",
    examples: [
      { title: "HTTP Client & External Systems", code: oraclePackageIntegration, filename: "integration_pkg.sql" },
    ]
  },
  {
    id: "oracle-ddl",
    title: "Oracle DDL Best Practices",
    badge: "DDL",
    examples: [
      { title: "Tables, Partitions & Indexes", code: oracleDDL, filename: "ddl_best_practices.sql" },
    ]
  },
  {
    id: "oracle-admin",
    title: "Oracle User Administration",
    badge: "Security",
    examples: [
      { title: "Users, Roles & VPD", code: oracleUserAdmin, filename: "user_admin.sql" },
    ]
  },
  {
    id: "postgres-advanced",
    title: "PostgreSQL Advanced",
    badge: "PostgreSQL",
    examples: [
      { title: "JSONB, Window Functions, CTE", code: postgresAdvanced, filename: "advanced.sql" },
    ]
  },
  {
    id: "postgres-rls",
    title: "PostgreSQL Row Level Security",
    badge: "Security",
    examples: [
      { title: "RLS Policies & Multi-tenant", code: postgresRLS, filename: "rls_policies.sql" },
    ]
  },
];

const DatabaseExamples = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-[hsl(var(--terminal-orange))]/10 text-[hsl(var(--terminal-orange))] border-[hsl(var(--terminal-orange))]/30">
                  {category.badge}
                </Badge>
                <span className="font-mono text-sm">{category.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {category.examples.map((example, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{example.title}</h4>
                  <CodeBlock 
                    code={example.code} 
                    language="sql" 
                    filename={example.filename}
                    collapsible
                    defaultExpanded={idx === 0}
                  />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default DatabaseExamples;
