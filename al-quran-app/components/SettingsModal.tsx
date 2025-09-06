import React from 'react';
import { CloseIcon, SunIcon, MoonIcon, FacebookIcon, InstagramIcon, TelegramIcon, XIcon, WhatsappIcon, EmailIcon, LocationIcon, TeamIcon } from './Icons';

type Theme = 'light' | 'dark';
type Color = 'teal' | 'blue' | 'rose' | 'amber' | 'violet';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    themeColor: Color;
    setThemeColor: (color: Color) => void;
}

const colors: { name: Color, bgClass: string }[] = [
    { name: 'teal', bgClass: 'bg-teal-500' },
    { name: 'blue', bgClass: 'bg-blue-500' },
    { name: 'rose', bgClass: 'bg-rose-500' },
    { name: 'amber', bgClass: 'bg-amber-500' },
    { name: 'violet', bgClass: 'bg-violet-500' },
];

const socialLinks = [
    { href: 'https://www.facebook.com/yns.dhb', icon: <FacebookIcon className="w-5 h-5" />, label: 'Facebook' },
    { href: 'https://www.instagram.com/youness_eddahby', icon: <InstagramIcon className="w-5 h-5" />, label: 'Instagram' },
    { href: 'https://t.me/youness_eddahby', icon: <TelegramIcon className="w-5 h-5" />, label: 'Telegram' },
    { href: 'https://x.com/YounessEddahby', icon: <XIcon className="w-5 h-5" />, label: 'Twitter/X' },
    { href: 'https://wa.me/qr/FCEFAKNUJNCIF1', icon: <WhatsappIcon className="w-5 h-5" />, label: 'WhatsApp' },
];

const contactInfo = [
    { href: 'mailto:eddahbyyouness7@gmail.com', icon: <EmailIcon />, label: 'eddahbyyouness7@gmail.com' },
    { icon: <LocationIcon />, label: 'Kalaat M\'Gouna, Morocco' },
    { icon: <TeamIcon />, label: 'Team: YNS-DHB' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme, themeColor, setThemeColor }) => {
    if (!isOpen) return null;

    const handleThemeToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10">
                    <h2 id="settings-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close settings"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Theme Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Appearance</h3>
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                            <span className="font-medium">Theme</span>
                            <div className="relative inline-flex items-center cursor-pointer" onClick={handleThemeToggle}>
                                <div className="flex items-center gap-2 p-1 rounded-full bg-gray-200 dark:bg-gray-900">
                                    <span className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? `bg-white dark:bg-gray-700 text-${themeColor}-600` : 'text-gray-500'}`}><SunIcon /></span>
                                    <span className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? `bg-white dark:bg-gray-700 text-${themeColor}-600` : 'text-gray-500'}`}><MoonIcon /></span>
                                </div>
                            </div>
                        </div>
                        {/* Accent Color */}
                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                            <span className="font-medium">Accent Color</span>
                            <div className="flex items-center space-x-2">
                                {colors.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => setThemeColor(color.name)}
                                        className={`w-6 h-6 rounded-full ${color.bgClass} transition-transform hover:scale-110 ${themeColor === color.name ? `ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-700/50 ring-${color.name}-500` : ''}`}
                                        aria-label={`Set accent color to ${color.name}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* About the Developer */}
                    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">About the Developer</h3>
                        <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg space-y-3">
                           {contactInfo.map((item, index) => (
                               <div key={index} className="flex items-center space-x-3 text-sm text-gray-800 dark:text-gray-200">
                                   <span className={`text-${themeColor}-600 dark:text-${themeColor}-400`}>{item.icon}</span>
                                   {item.href ? (
                                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.label}</a>
                                   ) : (
                                        <span>{item.label}</span>
                                   )}
                               </div>
                           ))}
                        </div>
                         <div className="grid grid-cols-3 gap-2 pt-2">
                            {socialLinks.map(link => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-${themeColor}-600 dark:hover:text-${themeColor}-400 transition-colors`}
                                >
                                    {link.icon}
                                    <span className="text-xs font-medium">{link.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;