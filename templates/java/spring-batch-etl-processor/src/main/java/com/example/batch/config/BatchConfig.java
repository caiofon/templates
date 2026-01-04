package com.example.batch.config;

import com.example.batch.listener.JobCompletionNotificationListener;
import com.example.batch.model.User;
import com.example.batch.processor.UserItemProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.database.BeanPropertyItemSqlParameterSourceProvider;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.batch.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

@Configuration
@RequiredArgsConstructor
public class BatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final JobCompletionNotificationListener jobListener;
    private final UserItemProcessor userProcessor;

    // Reader - CSV File
    @Bean
    @StepScope
    public FlatFileItemReader<User> reader(
            @Value("#{jobParameters['inputFile']}") Resource inputFile) {
        return new FlatFileItemReaderBuilder<User>()
                .name("userItemReader")
                .resource(inputFile != null ? inputFile : new ClassPathResource("users.csv"))
                .delimited()
                .names("firstName", "lastName", "email", "phone")
                .fieldSetMapper(new BeanWrapperFieldSetMapper<>() {{
                    setTargetType(User.class);
                }})
                .linesToSkip(1) // Skip header
                .build();
    }

    // Writer - Database
    @Bean
    public JdbcBatchItemWriter<User> writer(DataSource dataSource) {
        return new JdbcBatchItemWriterBuilder<User>()
                .itemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvider<>())
                .sql("INSERT INTO users (first_name, last_name, email, phone, status, created_at) " +
                     "VALUES (:firstName, :lastName, :email, :phone, :status, :createdAt)")
                .dataSource(dataSource)
                .build();
    }

    // Step Configuration
    @Bean
    public Step importUserStep(FlatFileItemReader<User> reader, JdbcBatchItemWriter<User> writer) {
        return new StepBuilder("importUserStep", jobRepository)
                .<User, User>chunk(100, transactionManager)
                .reader(reader)
                .processor(userProcessor)
                .writer(writer)
                .faultTolerant()
                .skipLimit(10)
                .skip(Exception.class)
                .retryLimit(3)
                .retry(Exception.class)
                .build();
    }

    // Job Configuration
    @Bean
    public Job importUserJob(Step importUserStep) {
        return new JobBuilder("importUserJob", jobRepository)
                .incrementer(new RunIdIncrementer())
                .listener(jobListener)
                .flow(importUserStep)
                .end()
                .build();
    }
}
