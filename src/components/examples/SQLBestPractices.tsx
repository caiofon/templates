import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

const explainPlan = `-- EXPLAIN PLAN - Análise de Performance de Queries
-- =================================================

-- ==================== ORACLE EXPLAIN PLAN ====================

-- Gerar explain plan
EXPLAIN PLAN FOR
SELECT o.order_id, o.order_date, c.customer_name, SUM(oi.quantity * oi.unit_price) as total
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_date >= DATE '2024-01-01'
  AND c.status = 'ACTIVE'
GROUP BY o.order_id, o.order_date, c.customer_name
ORDER BY total DESC;

-- Visualizar o plano
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- Resultado típico:
-- -------------------------------------------------------------------------------------
-- | Id  | Operation                      | Name           | Rows  | Bytes | Cost (%CPU)|
-- -------------------------------------------------------------------------------------
-- |   0 | SELECT STATEMENT               |                |    50 |  2550 |    42   (5)|
-- |   1 |  SORT ORDER BY                 |                |    50 |  2550 |    42   (5)|
-- |   2 |   HASH GROUP BY                |                |    50 |  2550 |    41   (3)|
-- |   3 |    HASH JOIN                   |                |   500 | 25500 |    40   (0)|
-- |   4 |     TABLE ACCESS BY INDEX ROWID| CUSTOMERS      |   100 |  2000 |    12   (0)|
-- |*  5 |      INDEX RANGE SCAN          | IDX_CUST_STATUS|   100 |       |     2   (0)|
-- |   6 |     HASH JOIN                  |                |  5000 |155000 |    27   (0)|
-- |*  7 |      TABLE ACCESS FULL         | ORDERS         |  1000 | 20000 |    15   (0)|
-- |   8 |      TABLE ACCESS FULL         | ORDER_ITEMS    | 10000 |110000 |    12   (0)|
-- -------------------------------------------------------------------------------------

-- Analisar com estatísticas reais (após execução)
SELECT /*+ GATHER_PLAN_STATISTICS */ o.order_id, ...
FROM orders o ...;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST'));

-- ==================== POSTGRESQL EXPLAIN ====================

-- Explain básico (estimativa)
EXPLAIN 
SELECT o.order_id, o.order_date, c.customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_date >= '2024-01-01';

-- Explain ANALYZE (executa a query!)
EXPLAIN ANALYZE
SELECT o.order_id, o.order_date, c.customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_date >= '2024-01-01';

-- Explain com mais detalhes
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT ...;

-- Resultado típico:
-- Hash Join  (cost=25.00..100.00 rows=500 width=50) (actual time=0.5..2.3 rows=487 loops=1)
--   Hash Cond: (o.customer_id = c.customer_id)
--   Buffers: shared hit=45
--   ->  Seq Scan on orders o  (cost=0.00..50.00 rows=1000 width=30) (actual time=0.01..0.8 rows=1000 loops=1)
--         Filter: (order_date >= '2024-01-01'::date)
--         Rows Removed by Filter: 500
--         Buffers: shared hit=25
--   ->  Hash  (cost=15.00..15.00 rows=200 width=20) (actual time=0.3..0.3 rows=200 loops=1)
--         Buckets: 1024  Batches: 1  Memory Usage: 15kB
--         Buffers: shared hit=10
--         ->  Seq Scan on customers c  (cost=0.00..15.00 rows=200 width=20) (actual time=0.01..0.2 rows=200 loops=1)
--               Buffers: shared hit=10
-- Planning Time: 0.2 ms
-- Execution Time: 2.5 ms

-- ==================== O QUE OBSERVAR ====================

-- 🔴 PROBLEMAS COMUNS:
-- 1. TABLE ACCESS FULL em tabelas grandes (deveria usar índice)
-- 2. Nested Loop com muitas rows (deveria ser Hash Join)
-- 3. Sort em disco (memory insuficiente)
-- 4. Rows estimadas muito diferente de actual
-- 5. Index não utilizado quando deveria

-- ✅ INDICADORES BONS:
-- 1. Index Range Scan / Index Only Scan
-- 2. Hash Join para junções grandes
-- 3. Rows estimadas próximas de actual
-- 4. Buffers hit vs read (cache hit)
-- 5. Low cost operations`;

const indexStrategies = `-- Estratégias de Índices - Oracle e PostgreSQL
-- =============================================

-- ==================== TIPOS DE ÍNDICES ====================

-- 1. B-Tree Index (Padrão) - Igualdade e range
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);

-- 2. Composite Index (múltiplas colunas)
-- Ordem importa! Mais seletivo primeiro
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date DESC);
-- Funciona para: WHERE customer_id = X
-- Funciona para: WHERE customer_id = X AND order_date > Y
-- NÃO funciona para: WHERE order_date > Y (precisa da primeira coluna)

-- 3. Covering Index (INCLUDE) - Evita acesso à tabela
CREATE INDEX idx_orders_covering ON orders(customer_id)
INCLUDE (order_date, status, total_amount);
-- Query pode ser resolvida apenas com o índice

-- 4. Partial/Filtered Index - Apenas subset de dados
-- PostgreSQL
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'PENDING';

-- Oracle (Function-based com CASE)
CREATE INDEX idx_orders_pending ON orders(
    CASE WHEN status = 'PENDING' THEN created_at END
);

-- 5. Function-based Index
-- Oracle
CREATE INDEX idx_customers_email_upper ON customers(UPPER(email));
-- PostgreSQL
CREATE INDEX idx_customers_email_lower ON customers(LOWER(email));

-- Query deve usar a mesma função:
SELECT * FROM customers WHERE UPPER(email) = 'JOHN@EXAMPLE.COM';

-- 6. Bitmap Index (Oracle - OLAP, baixa cardinalidade)
CREATE BITMAP INDEX idx_orders_status_bmp ON orders(status);
-- Ideal para: colunas com poucos valores distintos (status, tipo, categoria)
-- NÃO usar para: tabelas com muitos INSERTs/UPDATEs concorrentes

-- 7. GIN Index (PostgreSQL - JSONB, Arrays, Full-text)
CREATE INDEX idx_events_data ON events USING GIN (event_data);
CREATE INDEX idx_products_tags ON products USING GIN (tags);
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('english', name || ' ' || description));

-- 8. BRIN Index (PostgreSQL - dados ordenados fisicamente)
CREATE INDEX idx_logs_timestamp ON logs USING BRIN (created_at);
-- Muito eficiente para tabelas append-only ordenadas por data

-- ==================== QUANDO CRIAR ÍNDICE ====================

-- ✅ CRIAR índice quando:
-- 1. Coluna usada frequentemente em WHERE
-- 2. Coluna usada em JOIN
-- 3. Coluna usada em ORDER BY
-- 4. Alta seletividade (muitos valores distintos)
-- 5. Tabela grande (>10k rows)

-- ❌ NÃO criar índice quando:
-- 1. Tabela pequena
-- 2. Coluna raramente consultada
-- 3. Coluna frequentemente atualizada
-- 4. Baixa seletividade (poucos valores - considere bitmap)
-- 5. Tabela com muitos INSERTs (índices têm custo de manutenção)

-- ==================== ANALISAR USO DE ÍNDICES ====================

-- Oracle - Índices não utilizados
SELECT index_name, table_name, monitoring, used
FROM v$object_usage
WHERE used = 'NO';

-- PostgreSQL - Estatísticas de uso
SELECT 
    schemaname, tablename, indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Índices duplicados/redundantes
SELECT 
    a.indexrelid::regclass AS index1,
    b.indexrelid::regclass AS index2
FROM pg_index a
JOIN pg_index b ON a.indrelid = b.indrelid 
    AND a.indexrelid < b.indexrelid
WHERE (a.indkey::text LIKE b.indkey::text || '%'
    OR b.indkey::text LIKE a.indkey::text || '%');

-- ==================== MANUTENÇÃO DE ÍNDICES ====================

-- Oracle - Rebuild index
ALTER INDEX idx_orders_date REBUILD ONLINE;

-- Oracle - Verificar fragmentação
SELECT index_name, blevel, leaf_blocks, distinct_keys,
       clustering_factor
FROM user_indexes
WHERE table_name = 'ORDERS';

-- PostgreSQL - Reindex
REINDEX INDEX idx_orders_date;
REINDEX TABLE orders;

-- PostgreSQL - Vacuum e Analyze
VACUUM ANALYZE orders;`;

const queryOptimization = `-- Query Optimization Best Practices
-- ==================================

-- ==================== SELECT OPTIMIZATION ====================

-- ❌ EVITAR: SELECT *
SELECT * FROM orders WHERE customer_id = 123;

-- ✅ PREFERIR: Colunas específicas
SELECT order_id, order_date, total_amount, status
FROM orders 
WHERE customer_id = 123;

-- ❌ EVITAR: Funções em colunas filtradas
SELECT * FROM customers 
WHERE UPPER(email) = 'JOHN@EXAMPLE.COM';  -- Não usa índice normal

-- ✅ PREFERIR: Índice function-based ou normalizar dados
SELECT * FROM customers 
WHERE email_normalized = 'john@example.com';  -- Coluna já normalizada

-- ❌ EVITAR: OR que impede uso de índice
SELECT * FROM orders 
WHERE customer_id = 123 OR status = 'PENDING';

-- ✅ PREFERIR: UNION ALL quando apropriado
SELECT * FROM orders WHERE customer_id = 123
UNION ALL
SELECT * FROM orders WHERE status = 'PENDING' AND customer_id != 123;

-- ==================== JOIN OPTIMIZATION ====================

-- ❌ EVITAR: Joins implícitos (estilo antigo)
SELECT o.*, c.name
FROM orders o, customers c
WHERE o.customer_id = c.customer_id;

-- ✅ PREFERIR: Joins explícitos
SELECT o.order_id, o.order_date, c.name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id;

-- ❌ EVITAR: Joins desnecessários
SELECT o.order_id, o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_date > '2024-01-01';
-- Se não usa dados de customers, não precisa do join!

-- ✅ PREFERIR: Apenas joins necessários
SELECT order_id, total_amount
FROM orders
WHERE order_date > '2024-01-01';

-- EXISTS vs IN vs JOIN
-- Para verificar existência, EXISTS geralmente é mais eficiente

-- ❌ IN com subquery grande
SELECT * FROM orders 
WHERE customer_id IN (SELECT customer_id FROM premium_customers);

-- ✅ EXISTS
SELECT * FROM orders o
WHERE EXISTS (
    SELECT 1 FROM premium_customers pc 
    WHERE pc.customer_id = o.customer_id
);

-- ✅ JOIN (quando precisa de dados da outra tabela)
SELECT o.* 
FROM orders o
JOIN premium_customers pc ON o.customer_id = pc.customer_id;

-- ==================== SUBQUERY OPTIMIZATION ====================

-- ❌ EVITAR: Subquery correlacionada no SELECT
SELECT 
    o.order_id,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) as item_count
FROM orders o;

-- ✅ PREFERIR: JOIN com agregação
SELECT o.order_id, COALESCE(oi.item_count, 0) as item_count
FROM orders o
LEFT JOIN (
    SELECT order_id, COUNT(*) as item_count
    FROM order_items
    GROUP BY order_id
) oi ON o.order_id = oi.order_id;

-- ==================== PAGINATION ====================

-- ❌ EVITAR: OFFSET grande
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 10000;
-- Precisa ler 10000 rows para descartar!

-- ✅ PREFERIR: Keyset pagination
SELECT * FROM orders 
WHERE created_at < '2024-01-15 10:30:00'  -- Último valor da página anterior
ORDER BY created_at DESC 
LIMIT 20;

-- ✅ Com cursor/seek method
SELECT * FROM orders 
WHERE (created_at, order_id) < ('2024-01-15 10:30:00', 'abc123')
ORDER BY created_at DESC, order_id DESC
LIMIT 20;

-- ==================== AGGREGATION ====================

-- ❌ EVITAR: COUNT(*) em tabelas grandes sem filtro
SELECT COUNT(*) FROM orders;  -- Full table scan

-- ✅ PREFERIR: Estatísticas aproximadas quando possível
-- PostgreSQL
SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = 'orders';

-- Oracle
SELECT num_rows FROM user_tables WHERE table_name = 'ORDERS';

-- ❌ EVITAR: Múltiplas agregações com subqueries
SELECT 
    (SELECT COUNT(*) FROM orders WHERE status = 'PENDING') as pending,
    (SELECT COUNT(*) FROM orders WHERE status = 'COMPLETED') as completed;

-- ✅ PREFERIR: Agregação condicional
SELECT 
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed
FROM orders;

-- Oracle (CASE)
SELECT 
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
FROM orders;

-- ==================== BULK OPERATIONS ====================

-- ❌ EVITAR: INSERTs individuais em loop
-- No código: for each item: INSERT INTO table VALUES (item)

-- ✅ PREFERIR: Batch INSERT
INSERT INTO order_items (order_id, product_id, quantity)
VALUES 
    ('ord-1', 'prod-1', 5),
    ('ord-1', 'prod-2', 3),
    ('ord-1', 'prod-3', 1);

-- PostgreSQL - COPY para grandes volumes
COPY orders FROM '/path/to/orders.csv' WITH CSV HEADER;

-- Oracle - INSERT ALL
INSERT ALL
    INTO order_items (order_id, product_id, quantity) VALUES ('ord-1', 'prod-1', 5)
    INTO order_items (order_id, product_id, quantity) VALUES ('ord-1', 'prod-2', 3)
SELECT 1 FROM DUAL;

-- ==================== LOCKING ====================

-- Evitar locks longos
-- ❌ Lock exclusivo desnecessário
SELECT * FROM orders FOR UPDATE;

-- ✅ Lock apenas as rows necessárias
SELECT * FROM orders 
WHERE order_id = 'ord-123' 
FOR UPDATE SKIP LOCKED;  -- Pula rows já locked

-- PostgreSQL - NOWAIT para falhar rápido
SELECT * FROM orders 
WHERE order_id = 'ord-123' 
FOR UPDATE NOWAIT;`;

const categories = [
  {
    id: "explain",
    title: "Explain Plan",
    badge: "Performance",
    examples: [
      { title: "Análise de Queries", code: explainPlan, filename: "explain-plan.sql" },
    ]
  },
  {
    id: "indexes",
    title: "Estratégias de Índices",
    badge: "Indexes",
    examples: [
      { title: "Tipos e Boas Práticas", code: indexStrategies, filename: "index-strategies.sql" },
    ]
  },
  {
    id: "optimization",
    title: "Query Optimization",
    badge: "Otimização",
    examples: [
      { title: "Best Practices", code: queryOptimization, filename: "query-optimization.sql" },
    ]
  },
];

const SQLBestPractices = () => {
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

export default SQLBestPractices;
