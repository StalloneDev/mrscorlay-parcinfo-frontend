import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function updateImports(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(
    /from ['"]\.\.\/\.\.\/shared\/schema['"]/g,
    'from \'@shared/schema\''
  );
  writeFileSync(filePath, updatedContent);
}

const files = [
  'src/components/forms/employee-form.tsx',
  'src/components/forms/equipment-form.tsx',
  'src/components/forms/inventory-form.tsx',
  'src/components/forms/license-form.tsx',
  'src/components/forms/ticket-form.tsx',
  'src/components/forms/user-form.tsx',
  'src/hooks/use-notifications.ts',
  'src/pages/employees.tsx',
  'src/pages/equipment.tsx',
  'src/pages/inventory.tsx',
  'src/pages/licenses.tsx',
  'src/pages/planning.tsx',
  'src/pages/tickets.tsx',
  'src/pages/users.tsx',
  'src/types/inventory.ts'
];

files.forEach(file => {
  const filePath = join(__dirname, file);
  if (existsSync(filePath)) {
    updateImports(filePath);
    console.log(`Updated imports in ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
}); 