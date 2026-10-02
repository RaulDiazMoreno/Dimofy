package es.rdm.Dimofy.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import es.rdm.Dimofy.repository.Usuarios;

public class CustomUserDetails implements UserDetails {

    private Usuarios usuario;

    public CustomUserDetails(Usuarios usuario) {
        this.usuario = usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
    	List<SimpleGrantedAuthority> authorities = new ArrayList<>();

    	if (usuario.isAdmin()) {
    	    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
    	} else {
    	    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
    	}

    	return authorities;

    }

    @Override
    public String getPassword() {
        return usuario.getPassW();
    }

    @Override
    public String getUsername() {
        return usuario.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    public Usuarios getUsuario() {
        return usuario;
    }
}
