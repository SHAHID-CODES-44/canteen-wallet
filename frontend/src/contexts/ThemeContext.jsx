import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('parentTheme') === 'dark';
    });

    const toggleTheme = () => {
        setIsDark(prev => {
            const newVal = !prev;
            localStorage.setItem('parentTheme', newVal ? 'dark' : 'light');
            return newVal;
        });
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);