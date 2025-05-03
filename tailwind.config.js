/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#4f46e5",
                "primary-hover": "#4338ca",
            },
            fontSize: {
                'xxs': ['0.65rem', { lineHeight: '0.9rem' }],
            },
            gridTemplateColumns: {
                'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))',
            }
        },
    },
    plugins: [],
} 