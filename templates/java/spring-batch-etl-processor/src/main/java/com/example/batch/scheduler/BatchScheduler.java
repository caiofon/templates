package com.example.batch.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final Job importUserJob;

    // Run every day at 2 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void runImportUserJob() {
        try {
            JobParameters params = new JobParametersBuilder()
                    .addLong("timestamp", System.currentTimeMillis())
                    .addString("inputFile", "classpath:users.csv")
                    .toJobParameters();
                    
            log.info("Starting scheduled import user job");
            jobLauncher.run(importUserJob, params);
            log.info("Import user job completed");
            
        } catch (Exception e) {
            log.error("Error running import user job", e);
        }
    }
}
