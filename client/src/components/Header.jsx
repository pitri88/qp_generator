import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ name, page, logo }) {
    const navigate = useNavigate();

    return (
        <div className="header">
            <div className="header-content">
                <div className="logo-section">
                    <img src={logo} alt="Profile" className="profile-logo" />
                    <h2>{name}</h2>
                </div>
                <h1>{page}</h1>
            </div>
            <style jsx>{`
                .header {
                    background-color: #f8f9fa;
                    padding: 1rem 2rem;
                    border-bottom: 1px solid #dee2e6;
                    margin-bottom: 2rem;
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .profile-logo {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                h1, h2 {
                    margin: 0;
                }

                h1 {
                    color: #2c3e50;
                    font-size: 1.8rem;
                }

                h2 {
                    color: #34495e;
                    font-size: 1.2rem;
                }
            `}</style>
        </div>
    );
}
