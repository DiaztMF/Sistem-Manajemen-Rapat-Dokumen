import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Calendar & Document Shield Hybrid Logo */}
            <path d="M8 2v4M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" fill="currentColor" fillOpacity="0.1" />
            <path d="M3 10h18" />
            <path d="m9 16 2 2 4-4" strokeWidth="2.5" />
        </svg>
    );
}
