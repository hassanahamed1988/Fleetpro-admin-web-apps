# Global Project Guidelines & Rules

## Global Responsive Width & Content-Fit Layout Rule

This rule applies universally across all Modal Popups, View Pages, Primary Cards, Form Containers, and Tables.

### 1. Content-Based Width Determination
- The longest/largest text content (e.g., Long Names, Email Addresses, ID/Numbers, Company Names, Transaction IDs, Data Values) inside any Container, Table, or Form MUST serve as the reference for calculating container width.
- Layout width MUST dynamically follow the hierarchy:
  `Content Length` → `Required Table Width` → `Required Container Width` → `Popup / Page Width`

### 2. Zero Unnecessary Empty Space & Anti-Awkward Wrapping
- Do NOT generate excessive blank/empty side space when content is large or when content is small.
- Avoid awkward, premature wrapping or truncation of primary labels and long identifiers.
- Modals, Primary Cards, and Data Tables should naturally expand up to their optimal responsive viewport bounds (`min(96vw, ...)` or fluid container boundaries) to comfortably house long content without horizontal squishing.

### 3. Responsive Adaptability
- **Desktop & Large Displays**: Containers and tables utilize comfortable auto-fit width to prevent cramped lines and awkward text breaks.
- **Tablets & Mobile Screens**: Implement smooth horizontal scrolling (`overflow-x-auto`), fluid single-column adaptive grids (`app-form-grid`), and controlled wrap margins without horizontal page breaks.
- Preserve existing application functionality, database models, and business logic.
