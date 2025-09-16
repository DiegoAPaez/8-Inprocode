package com.spring.restaurantmanagementsystem.controller;

import com.spring.restaurantmanagementsystem.dto.CreateStoreRequest;
import com.spring.restaurantmanagementsystem.dto.StoreDto;
import com.spring.restaurantmanagementsystem.dto.UpdateStoreRequest;
import com.spring.restaurantmanagementsystem.dto.UserDto;
import com.spring.restaurantmanagementsystem.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stores")
@PreAuthorize("hasRole('ADMIN')")
public class StoreController {
    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping
    public ResponseEntity<List<StoreDto>> getAllStores() {
        List<StoreDto> stores = storeService.getAllStores();
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreDto> getStoreById(@PathVariable Long id) {
        StoreDto store = storeService.getStoreById(id);
        return ResponseEntity.ok(store);
    }

    @PostMapping
    public ResponseEntity<StoreDto> createStore(@Valid @RequestBody CreateStoreRequest request) {
        StoreDto createdStore = storeService.createStore(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStore);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoreDto> updateStore(@PathVariable Long id, @Valid @RequestBody UpdateStoreRequest request) {
        StoreDto updatedStore = storeService.updateStore(id, request);
        return ResponseEntity.ok(updatedStore);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteStore(@PathVariable Long id) {
        storeService.deleteStore(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Store deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/users")
    public ResponseEntity<List<UserDto>> getUsersByStore(@PathVariable Long id) {
        List<UserDto> users = storeService.getUsersByStoreId(id);
        return ResponseEntity.ok(users);
    }
}
