/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/*.tsx", "./src/**/*.tsx"],
  theme: {
    extend: {
      textColor: {
        prop: "#4E9590",
        string: "#000",
        number: "#BFBFBF",
        array: "#F2CAB8",
      },
    },
  },
  plugins: [],
};
