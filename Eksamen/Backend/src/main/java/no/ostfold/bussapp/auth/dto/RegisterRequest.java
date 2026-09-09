package no.ostfold.bussapp.auth.dto;

public class RegisterRequest {
    private String name;
    private String password;

    public RegisterRequest() {}
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

