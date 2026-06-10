# Developer Instructions & Alignment Checklist

These instructions establish strict constraints and focus boundaries for AI engineering assistants working on this project. They ensure alignment with the user's specific goals, requested aesthetics, and code footprint constraints.

---

## 🎯 Core Directives

### 1. Maintain Absolute Focus on Requested Scope
*   **No Unsolicited Work**: Only work on the files, features, and fixes explicitly requested in the user prompt. 
*   **Do Not Implement Placeholders**: Do not write mock implementations or placeholder code/hooks/services for unrequested features. If a file is currently unused, leave it empty or use `export {};` to ensure compilation.
*   **Clarify Before Expanding**: If you see an opportunity for a refactor or extra feature outside the immediate scope, **do not write the code**. Instead, describe the idea to the user and explicitly ask for permission first.

### 2. Adhere Strictly to the Provided Design
*   **Visual Fidelity**: Follow the exact UI layouts, visual designs, structures, and color palettes provided in the screenshots or layout mockups. When given an image, recreate it exactly down to every single pixel (spacing, ordering, icons, alignment, font sizes, colors, and shadows).
*   **Premium Aesthetics**: Maintain the modern dark theme design system tokens defined in `globals.css` (e.g., `#080c10` background, `#00c896` brand color, glassmorphism, responsive viewport fit, hidden scrollbars). Do not introduce random third-party templates or misaligned styles.
*   **Viewport Constraints**: Prioritize viewport responsiveness. Layouts should fit perfectly inside desktop resolutions without vertical window scrollbars, and gracefully degrade to scrolling stacks on mobile.

### 3. Progressive and Safe Execution
*   Verify that any changes compile perfectly with strict TypeScript checking and Next.js linting:
    ```bash
    npm run build
    ```
*   Keep existing, unrelated files intact. Do not perform large codebase sweeps or delete active modules without explicit instructions.

### 4. Architecture & Code Quality
*   **Clean Architecture**: Always structure and write code using Clean Architecture principles and clean coding practices.
*   **Pragmatic Refactoring**: Refactor every time we add a new feature or page, but *only if genuinely needed* to maintain long-term scalability.

### 5. Security
*   **Security First**: Keep security as your ultimate, first responsibility. Always adhere to best practices for authentication, authorization, and data validation.

### 6. Always Use Agent Skills
*   **Skill Utilization**: Always use designated skills to aid in doing your task and achieving the perfect output. Before writing code, use the `find-skills` skill to dynamically search for and equip the best matching skill for the work you are about to do.

### 7. Native Right-to-Left (RTL) Support
*   **RTL by Default**: All layout features, components, and code updates must be built with strict RTL (Right-to-Left) direction support in mind (e.g. alignment, Arabic content structure, flex direction, icons order, and logical paddings/margins).

---

## 🛠️ Tech Stack & Technologies

**Front End:**
1. React (Next.js)
2. Tailwind CSS
3. TanStack Query / Zustand
4. Next Auth
5. ShadCn / Radix / Framer Motion
6. React-Hook-Form - Yup
7. Axios
8. Echarts
9. React Icons

---