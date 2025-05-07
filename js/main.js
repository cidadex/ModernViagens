/**
 * ViajarMax - Main JavaScript File
 * This file contains all the JavaScript functionality for the redesigned ViajarMax website
 */

// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const searchTabs = document.querySelectorAll('.search-tabs .tab');
const searchForms = document.querySelectorAll('.search-form');
const backToTopBtn = document.querySelector('.back-to-top');

// Toggle Mobile Menu
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Search Form Tabs
if (searchTabs.length) {
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            searchTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all forms
            searchForms.forEach(form => form.classList.remove('active'));
            
            // Show the selected form
            const formId = tab.getAttribute('data-tab') + '-form';
            document.getElementById(formId).classList.add('active');
        });
    });
}

// Back to Top Button
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}



// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        }
    });
});

// Theme Toggle Functionality
function initializeThemeToggle() {
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    // Set theme to light only (dark theme disabled for now)
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    
    // Add event listener to theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            // Keep the theme on light regardless of toggle position
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        });
    }
}

// Initialize the website
document.addEventListener('DOMContentLoaded', () => {
    console.log('ViajarMax website loaded successfully!');
    
    // Set the first tab and form as active
    if (searchTabs.length > 0) {
        searchTabs[0].classList.add('active');
        searchForms[0].classList.add('active');
    }
    

    
    // Initialize theme toggle
    initializeThemeToggle();
});
