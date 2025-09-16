package com.spring.restaurantmanagementsystem.service;

import com.spring.restaurantmanagementsystem.dto.CreateStoreRequest;
import com.spring.restaurantmanagementsystem.dto.StoreDto;
import com.spring.restaurantmanagementsystem.dto.UpdateStoreRequest;
import com.spring.restaurantmanagementsystem.dto.UserDto;
import com.spring.restaurantmanagementsystem.exception.ResourceNotFoundException;
import com.spring.restaurantmanagementsystem.model.Store;
import com.spring.restaurantmanagementsystem.model.User;
import com.spring.restaurantmanagementsystem.repository.StoreRepository;
import com.spring.restaurantmanagementsystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.util.stream.Collectors.toSet;

@Service
public class StoreService {
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public StoreService(StoreRepository storeRepository, UserRepository userRepository) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }

    public List<StoreDto> getAllStores() {
        return storeRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public StoreDto getStoreById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        return convertToDto(store);
    }

    @Transactional
    public StoreDto createStore(CreateStoreRequest request) {
        Store store = new Store();
        store.setName(request.name());
        store.setLatitude(request.latitude());
        store.setLongitude(request.longitude());

        Store savedStore = storeRepository.save(store);
        return convertToDto(savedStore);
    }

    @Transactional
    public StoreDto updateStore(Long id, UpdateStoreRequest request) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

        store.setName(request.name());
        store.setLatitude(request.latitude());
        store.setLongitude(request.longitude());

        Store savedStore = storeRepository.save(store);
        return convertToDto(savedStore);
    }

    @Transactional
    public void deleteStore(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        storeRepository.delete(store);
    }

    public List<UserDto> getUsersByStoreId(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));

        return userRepository.findByStore(store)
                .stream()
                .map(this::convertUserToDto)
                .toList();
    }

    private StoreDto convertToDto(Store store) {
        return new StoreDto(
                store.getId(),
                store.getName(),
                store.getLatitude(),
                store.getLongitude()
        );
    }

    private UserDto convertUserToDto(User user) {
        StoreDto storeDto = null;
        if (user.getStore() != null) {
            Store store = user.getStore();
            storeDto = new StoreDto(
                    store.getId(),
                    store.getName(),
                    store.getLatitude(),
                    store.getLongitude()
            );
        }

        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(toSet()),
                storeDto
        );
    }
}
