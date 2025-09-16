package com.spring.restaurantmanagementsystem.repository;

import com.spring.restaurantmanagementsystem.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
}
