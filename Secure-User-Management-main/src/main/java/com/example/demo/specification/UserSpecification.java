package com.example.demo.specification;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> hasName(String name) {
        return (root, query, criteriaBuilder) ->
                name == null || name.isBlank()
                        ? null
                        : criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"
                );
    }

    public static Specification<User> hasEmail(String email) {
        return (root, query, criteriaBuilder) ->
                email == null || email.isBlank()
                        ? null
                        : criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        "%" + email.toLowerCase() + "%"
                );
    }

    public static Specification<User> hasRole(Role role) {
        return (root, query, criteriaBuilder) ->
                role == null
                        ? null
                        : criteriaBuilder.equal(
                        root.get("role"),
                        role
                );
    }

    public static Specification<User> isEmailVerified(Boolean emailVerified) {
        return (root, query, criteriaBuilder) ->
                emailVerified == null
                        ? null
                        : criteriaBuilder.equal(
                        root.get("emailVerified"),
                        emailVerified
                );
    }
}