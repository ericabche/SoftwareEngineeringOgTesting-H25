package no.ostfold.bussapp.auth.service;

import no.ostfold.bussapp.auth.model.User;
import no.ostfold.bussapp.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean register(String email, String password, String fullName) {
        if (userRepository.existsByEmail(email)) {
            return false;
        }
        
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setIsActive(true);
        
        userRepository.save(user);
        return true;
    }

    public boolean login(String email, String password) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !user.getIsActive()) {
            return false;
        }
        
        return passwordEncoder.matches(password, user.getPasswordHash());
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}
