# Spring Batch ETL Processor

ETL batch processing solution with Spring Batch, scheduled jobs, and monitoring.

## Features

- ✅ Chunk-oriented processing
- ✅ Job scheduling with cron expressions
- ✅ Skip and retry policies
- ✅ Job execution listeners
- ✅ Database partitioning for large datasets
- ✅ Batch metrics and monitoring

## Quick Start

```bash
mvn spring-boot:run
```

## Endpoints

- `POST /api/jobs/import-users` - Trigger user import job
- `GET /api/jobs/{executionId}` - Get job execution status
- `GET /api/jobs` - List all job executions
