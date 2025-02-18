import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../images/logo.svg';

export default function Header({ page }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="header">
            <div className="header-content">
                <div className="logo-section">
                    <img src={Logo} alt="Logo" className="logo" />
                    <div className="titles">
                        <h2>Question Paper Generator</h2>
                        <h3>Faculty Dashboard</h3>
                    </div>
                </div>
                <div className="page-title">
                    {page && <h1>{page}</h1>}
                </div>
                {user && (
                    <ProfileMenu 
                        userRole={user.role} 
                    />
                )}
            </div>
            <style jsx>{`
                .header {
                    background-color: #ffffff;
                    padding: 1rem 2rem;
                    border-bottom: 1px solid #dee2e6;
                    margin-bottom: 2rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    align-items: center;
                    gap: 2rem;
                    padding: 0 1rem;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .titles {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .logo {
                    width: 45px;
                    height: 45px;
                    object-fit: contain;
                }

                h1, h2, h3 {
                    margin: 0;
                }

                h1 {
                    color: #2c3e50;
                    font-size: 1.4rem;
                    font-weight: 500;
                    white-space: nowrap;
                }

                h2 {
                    color: #1976D2;
                    font-size: 1.2rem;
                    font-weight: 600;
                    white-space: nowrap;
                    line-height: 1.2;
                }

                h3 {
                    color: #64748b;
                    font-size: 0.95rem;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .page-title {
                    border-left: 2px solid #dee2e6;
                    padding-left: 2rem;
                    margin-left: 1rem;
                }
            `}</style>
        </div>
    );
}
