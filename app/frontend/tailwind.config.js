/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                xpurple: "#260026",
                xyellow: "#f7be64",
            },
        },
    },
    plugins: [],
};
