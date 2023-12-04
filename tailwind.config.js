/** @type {import('tailwindcss').Config} */
export const content = [
	"./index.html",
	'./src/pages/**/*.{js,ts,jsx,tsx}',
	'./src/components/**/*.{js,ts,jsx,tsx}',
	'./src/sections/**/*.{js,ts,jsx,tsx}',
	'./src/app/**/*.{js,ts,jsx,tsx}',
	'./src/flavors/*.{js,ts,jsx,tsx}',
	'./node_modules/flowbite/**/*.js'
];
export const theme = {
	extend: {},
};
export const plugins = [];
