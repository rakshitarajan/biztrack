import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import styles from './FeaturesPage.module.css'; // Import the CSS Module

// Import specific icons you want to use from Heroicons
import {
    ArrowRightIcon,
    SparklesIcon,
    ArrowsRightLeftIcon,
    CubeTransparentIcon,
    UsersIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

// --- Define image sequence ---
const landingImages = [
    '/landing/cart.png',    // Path relative to the public folder
    '/landing/boxes.png',
    '/landing/analytics.png'
];
const imageChangeInterval = 4000; // Time in milliseconds (e.g., 4 seconds)

const featuresData = [
    { id: 1, icon: SparklesIcon, title: 'Ease of Use & Amazing UI', description: 'Navigate effortlessly with our intuitive and beautifully designed user interface, making inventory management a breeze.' },
    { id: 2, icon: ArrowsRightLeftIcon, title: 'Combined Billing & Inventory', description: 'Generate invoices seamlessly, and watch your stock levels update automatically. No more manual reconciliation!' },
    { id: 3, icon: CubeTransparentIcon, title: 'Intelligent Stock Prediction', description: 'Leverage basic ML to forecast when products might run low, helping you reorder proactively and avoid stockouts.' },
    { id: 4, icon: UsersIcon, title: 'Role-Based Access Control', description: 'Securely manage your system with distinct logins and permissions for administrators and employees.' },
    { id: 5, icon: DocumentTextIcon, title: 'Comprehensive Invoice History', description: 'Easily access and review all past invoices, providing a clear audit trail and customer service insights.' },
    { id: 6, icon: ChartBarIcon, title: 'Insightful Analytics', description: 'Get a daily health check-up of your business with cool analytics, visualizing sales trends and inventory performance.' },
    { id: 7, icon: ShieldCheckIcon, title: 'Robust Security', description: 'Rest assured your data is protected, with security measures tested by our in-house ethical hackers.' },
];

const FeaturesPage = () => {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % landingImages.length);
        }, imageChangeInterval);
        return () => clearInterval(intervalId); // Cleanup interval
    }, []); // Run only on mount

    const renderFeatureIcon = (IconComponent) => {
        if (!IconComponent) return <span className={styles.fallbackIcon}>❓</span>;
        // Apply class for consistent sizing/styling if needed
        return <IconComponent className={styles.featureIconSvg} />;
    };

    // Inline styles for text gradients
    const logoStyle = {
        background: 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent', // Fallback color
    };
    const headlineStyle = {
        background: 'linear-gradient(to right, #ff7e5f, #feb47b, #f9d423, #ff7e5f)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
    };
    const subheadlineNameStyle = {
        fontWeight: '600',
        background: 'linear-gradient(to right, #a78bfa, #3b82f6)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
    };
    const featureTitleStyle = {
        background: 'linear-gradient(to right, #a78bfa, #3b82f6)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
    };

    return (
        <div className={styles.pageContainer}>

            {/* --- Navigation Bar --- */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logoLink} style={logoStyle}>
                        BizTrack
                    </Link>
                    <div className={styles.navActions}>
                        <button onClick={() => navigate('/login')} className={styles.loginButton}>
                            Login
                        </button>
                        <button onClick={() => navigate('/signup')} className={styles.signupButton}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <header className={styles.heroSection}>
                <div className={styles.heroColumnsContainer}>

                    {/* --- Left Column (Image Carousel) --- */}
                    <div className={styles.leftColumn}>
                        <div className={styles.imageCarousel}>
                            <img
                                key={currentImageIndex} // Key helps trigger animation on change
                                src={landingImages[currentImageIndex]}
                                alt={`BizTrack feature visual ${currentImageIndex + 1}`}
                                className={styles.carouselImage}
                            />
                        </div>
                    </div>

                    {/* --- Right Column (Text Content) --- */}
                    <div className={styles.rightColumn}>
                        <h1 className={styles.heroHeadline}>
                            <TypeAnimation
                                sequence={[
                                    'Tired of manual inventory management?', 4000,
                                    'Tired of tracking sales?', 4000,
                                    'Simplify your business.', 4000,
                                ]}
                                wrapper="span"
                                cursor={true}
                                repeat={Infinity}
                                style={headlineStyle}
                            />
                        </h1>
                        <p className={styles.heroSubheadline}>
                            <strong style={subheadlineNameStyle}>BizTrack</strong> streamlines your inventory & billing,
                            freeing you to focus on what matters most – growing your business.
                        </p>
                        <div>
                            <button onClick={() => navigate('/signup')} className={styles.heroCtaButton}>
                                Get Started Free
                                <ArrowRightIcon className={styles.ctaIcon} />
                            </button>
                        </div>
                    </div> {/* End Right Column */}

                </div> {/* End Hero Columns Container */}

                {/* Scroll down indicator */}
                <div className={styles.scrollIndicator}>
                    <a href="#features" aria-label="Scroll down to features">
                        <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                    </a>
                </div>
            </header>

            {/* --- Features Section --- */}
            <section id="features" className={styles.featuresSection}>
                <div className={styles.featuresContainer}>
                    <h2 className={styles.featuresTitle}>Why Choose BizTrack?</h2>
                    <p className={styles.featuresSubtitle}>
                        Everything you need to manage your inventory, sales, and business insights efficiently.
                    </p>
                    <div className={styles.featuresGrid}>
                        {featuresData.map((feature) => (
                            <div key={feature.id} className={styles.featureCard}>
                                <div className={styles.featureIconContainer}>
                                    {renderFeatureIcon(feature.icon)}
                                </div>
                                <h3 style={featureTitleStyle}>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Footer Section --- */}
            <footer className={styles.footer}>
                <p>© {new Date().getFullYear()} BizTrack. All rights reserved.</p>
                <p>Your smart solution for inventory and sales.</p>
            </footer>

        </div> // End Page Container
    );
};

export default FeaturesPage;