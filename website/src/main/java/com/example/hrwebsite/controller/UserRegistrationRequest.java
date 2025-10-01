package com.example.hrwebsite.controller;

import lombok.Data;

@Data
public class UserRegistrationRequest {
    private String name;
    private String email;
    private String password;
    private String role;
}
