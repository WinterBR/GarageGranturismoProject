package com.granturismo.garage.exception;

/** Thrown when login credentials don't match the single configured admin user. */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
