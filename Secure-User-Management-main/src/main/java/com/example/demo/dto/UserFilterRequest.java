package com.example.demo.dto;

import com.example.demo.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserFilterRequest {

    private String name;

    private String email;

    private Role role;

    private Boolean emailVerified;
}