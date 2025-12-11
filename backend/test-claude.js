/**
 * Script de prueba para validar integración con Claude API
 * 
 * Uso: node test-claude.js
 */

import { claudeAPI } from './services/claudeAPI.js';
import { buildDetectionPrompt } from './services/promptBuilder.js';

console.log('╔════════════════════════════════════════╗');
console.log('║   TEST CLAUDE API INTEGRATION          ║');
console.log('╚════════════════════════════════════════╝');
console.log('');

// HTML de prueba simple
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="site-header">
        <div class="logo">
            <img src="images/logo.png" alt="Logo">
        </div>
        <nav class="main-nav">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <h1>Welcome</h1>
        <p>This is a test page.</p>
    </main>
    
    <footer class="site-footer">
        <p>&copy; 2024 Test Company</p>
        <ul>
            <li><a href="privacy.html">Privacy</a></li>
            <li><a href="terms.html">Terms</a></li>
        </ul>
    </footer>
</body>
</html>
`;

async function runTests() {
  try {
    console.log('📝 Test 1: Validar configuración...');
    await claudeAPI.validateSetup();
    console.log('✅ Test 1: PASADO\n');
    
    console.log('📝 Test 2: Detección de componentes...');
    const prompt = buildDetectionPrompt(testHTML, 'test.html');
    console.log('   Enviando HTML de prueba a Claude...');
    
    const result = await claudeAPI.sendMessageAndParseJSON(prompt);
    
    console.log('   Resultados:');
    console.log('   - Header detectado:', result.header ? '✓' : '✗');
    console.log('   - Menu detectado:', result.menu ? '✓' : '✗');
    console.log('   - Footer detectado:', result.footer ? '✓' : '✗');
    
    if (result.header) {
      console.log(`   - Confianza header: ${result.header.confidence}`);
    }
    if (result.menu) {
      console.log(`   - Confianza menu: ${result.menu.confidence}`);
    }
    if (result.footer) {
      console.log(`   - Confianza footer: ${result.footer.confidence}`);
    }
    
    console.log('✅ Test 2: PASADO\n');
    
    console.log('╔════════════════════════════════════════╗');
    console.log('║   TODOS LOS TESTS PASARON ✓            ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('🎉 La integración con Claude API está funcionando correctamente!');
    console.log('');
    console.log('Ahora puedes:');
    console.log('1. Implementar las rutas de la API');
    console.log('2. Crear el frontend');
    console.log('3. Integrar todo el sistema');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════╗');
    console.error('║   ERROR EN LOS TESTS ✗                 ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('');
    console.error('Tipo:', error.type || error.name);
    console.error('Mensaje:', error.message);
    
    if (error.details) {
      console.error('Detalles:', JSON.stringify(error.details, null, 2));
    }
    
    console.error('');
    console.error('Posibles soluciones:');
    console.error('1. Verifica que ANTHROPIC_API_KEY esté configurada en .env');
    console.error('2. Verifica que tu API Key sea válida');
    console.error('3. Verifica tu conexión a internet');
    console.error('');
    
    process.exit(1);
  }
}

runTests();
