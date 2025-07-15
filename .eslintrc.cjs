// .eslintrc.cjs
module.exports = {
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: ["plugin:vue/vue3-recommended", "@vue/eslint-config-standard"],
  plugins: ["vue"],
};
