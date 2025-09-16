package com.spring.restaurantmanagementsystem.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Component
public class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void testConnection() {
        try (Connection connection = dataSource.getConnection()) {
            System.out.println("Database connected successfully!");
            System.out.println("Database: " + connection.getCatalog());
        } catch (SQLException e) {
            System.err.println("Database connection failed: " + e.getMessage());
        }
    }
}