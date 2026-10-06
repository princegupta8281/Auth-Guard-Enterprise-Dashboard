package com.example.demo.repository;
import com.example.demo.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name,
            String email,
            Pageable pageable
    );
    Optional<User> findByVerificationToken(String verificationToken);
    Optional<User> findByResetPasswordToken(String resetPasswordToken);
    long countByRole(Role role);

    long countByEmailVerified(boolean emailVerified);

    long count();
    @Query("SELECT EXTRACT(YEAR FROM u.createdAt), EXTRACT(MONTH FROM u.createdAt), COUNT(u) " +
           "FROM User u WHERE u.createdAt IS NOT NULL " +
           "GROUP BY EXTRACT(YEAR FROM u.createdAt), EXTRACT(MONTH FROM u.createdAt) " +
           "ORDER BY EXTRACT(YEAR FROM u.createdAt), EXTRACT(MONTH FROM u.createdAt)")
    List<Object[]> getMonthlyUserReport();
}