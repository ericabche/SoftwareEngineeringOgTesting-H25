package no.ostfold.bussapp.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt password hashes.
 * Run this main method to generate hashes for your test users.
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("BCrypt hashes for test users:");
        System.out.println("=============================");
        System.out.println("anna/pass123:  " + encoder.encode("pass123"));
        System.out.println("per/hemlig:    " + encoder.encode("hemlig"));
        System.out.println("julian/1234:   " + encoder.encode("1234"));
        System.out.println("admin/admin:   " + encoder.encode("admin"));
    }
}

