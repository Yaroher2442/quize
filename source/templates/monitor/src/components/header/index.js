import React from 'react';
import logoUrl from 'assets/logo.png';
import './style.css'

const Header = () => (
    <header>
        <div className="logo">
            <img id="logo" src={logoUrl} alt="logo"/>
        </div>
    </header>
)

export default Header;