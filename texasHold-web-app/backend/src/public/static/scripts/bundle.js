/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./frontend/public/js/login.js":
/*!*************************************!*\
  !*** ./frontend/public/js/login.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"login\": () => (/* binding */ login)\n/* harmony export */ });\nasync function login(event) {\n  const username = document.querySelector('#login-form input[name=\"username\"]').value;\n  const password = document.querySelector('#login-form input[name=\"password\"]').value;\n  try {\n    const response = await fetch('/user/login', {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify({\n        username,\n        password\n      })\n    });\n    if (response.status === 200) {\n      const userData = await response.json();\n      alert('User logged in successfully');\n      // Redirect to the desired page after successful login\n      location.href = '/';\n    } else {\n      const errorData = await response.json();\n      alert(errorData.message);\n    }\n  } catch (error) {\n    console.error(error);\n    alert('An error occurred during login');\n  }\n}\n\n//# sourceURL=webpack:///./frontend/public/js/login.js?");

/***/ }),

/***/ "./frontend/public/js/main.js":
/*!************************************!*\
  !*** ./frontend/public/js/main.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _register__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./register */ \"./frontend/public/js/register.js\");\n/* harmony import */ var _login__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./login */ \"./frontend/public/js/login.js\");\n\n\ndocument.addEventListener(\"DOMContentLoaded\", () => {\n  const registerForm = document.getElementById(\"register-form\");\n  const loginForm = document.getElementById(\"login-form\");\n  if (registerForm) {\n    registerForm.addEventListener(\"submit\", event => {\n      event.preventDefault();\n      (0,_register__WEBPACK_IMPORTED_MODULE_0__.register)(event);\n    });\n  }\n  if (loginForm) {\n    loginForm.addEventListener(\"submit\", event => {\n      event.preventDefault();\n      (0,_login__WEBPACK_IMPORTED_MODULE_1__.login)(event);\n    });\n  }\n});\n\n//# sourceURL=webpack:///./frontend/public/js/main.js?");

/***/ }),

/***/ "./frontend/public/js/register.js":
/*!****************************************!*\
  !*** ./frontend/public/js/register.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"register\": () => (/* binding */ register)\n/* harmony export */ });\nasync function register(event) {\n  const username = document.querySelector('#register-form input[name=\"username\"]').value;\n  const email = document.querySelector('#register-form input[name=\"email\"]').value;\n  const password = document.querySelector('#register-form input[name=\"password\"]').value;\n  try {\n    const response = await fetch('/user/register', {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify({\n        username,\n        email,\n        password\n      })\n    });\n    if (response.status === 201) {\n      alert('User created successfully');\n      location.href = '/user/login';\n    } else {\n      const errorData = await response.json();\n      alert(errorData.message);\n    }\n  } catch (error) {\n    console.error(error);\n    alert('An error occurred during registration');\n  }\n}\n\n//# sourceURL=webpack:///./frontend/public/js/register.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./frontend/public/js/main.js");
/******/ 	
/******/ })()
;